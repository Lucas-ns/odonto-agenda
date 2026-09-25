# OdontoFlow

Web app de agenda odontológica para o próprio dentista (MVP Fase 0 + 1).

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase Auth + Postgres
- Drizzle ORM
- React Hook Form + Zod

## Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com)

## Setup

1. Clone e instale:

```bash
npm install
cp .env.example .env.local
```

2. No Supabase Dashboard:
   - Crie um projeto
   - Copie **Project URL** e **anon key** para `.env.local`
   - Em **Database → Connection string**, copie a URL (pooler) para `DATABASE_URL`

3. Aplique o schema + RLS:

```bash
# Opção A — SQL Editor do Supabase: cole o conteúdo de
# supabase/migrations/0001_init.sql e execute

# Opção B — drizzle-kit (requer DATABASE_URL)
npm run db:push
# depois execute a parte de RLS/trigger do arquivo 0001_init.sql no SQL Editor
```

> O arquivo `0001_init.sql` inclui tabelas, índices, trigger de profile no signup e policies RLS.

4. Auth: em **Authentication → Providers**, deixe Email habilitado. Em **URL Configuration**, adicione `http://localhost:3000/auth/callback`.

5. Suba o app:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), crie a conta no login e o seed dos 6 serviços padrão roda no primeiro acesso.

### Seed manual (opcional)

```bash
USER_ID=<uuid-do-auth.users> npm run db:seed
```

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run db:generate` | Gera migration Drizzle |
| `npm run db:migrate` | Aplica migrations Drizzle |
| `npm run db:push` | Push do schema (dev) |
| `npm run db:seed` | Seed de serviços (`USER_ID` obrigatório) |

## Migrações

1. `supabase/migrations/0001_init.sql` — profiles, settings, services, patients, RLS
2. `supabase/migrations/0002_appointments.sql` — appointments, appointment_items, enums, RLS
3. `supabase/migrations/0003_schedule_blocks.sql` — bloqueios de agenda + RLS

Execute na ordem no SQL Editor do Supabase.

## Rotas

| Rota | Status |
|---|---|
| `/login` | Auth e-mail/senha + recuperação |
| `/agenda` | Dia / Semana / Lista |
| `/agenda/novo` | Novo agendamento |
| `/agenda/[id]` | Detalhe, status, pagamento, cancelar |
| `/pacientes` | CRUD + busca + histórico |
| `/servicos` | CRUD + desativar + seed |
| `/painel` | Resumo diário e mensal |
| `/configuracoes` | Clínica, horários e bloqueios |


## Marca e design

Tema **OdontoFlow** baseado em `.claude/idea/` (Plus Jakarta Sans + Inter, primary `#0284C7`, surfaces clínicos).
