# Odonto Agenda

Web app de agenda odontológica para o próprio dentista.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase Auth + Postgres
- Drizzle ORM

## Setup local

```bash
npm install
cp .env.example .env.local
```

Preencha `.env.local` com URL/keys do Supabase e `DATABASE_URL` (pooler).

Aplique as migrations em ordem no SQL Editor:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_appointments.sql`
3. `supabase/migrations/0003_schedule_blocks.sql`

```bash
npm run dev
```

## Acesso: sem signup público

O app **não permite criar conta pela tela de login**. Contas só entram via Supabase (invite ou usuário criado no Dashboard).

### 1. Desativar signup no Supabase (obrigatório)

1. Abra o [Dashboard](https://supabase.com/dashboard) → seu projeto  
2. **Authentication** → **Providers** → **Email**  
3. Desative **Allow new users to sign up** (ou equivalente “Enable sign ups”)  
4. Salve  

Assim ninguém cria conta nem pela API, mesmo tentando chamar `signUp`.

### 2. Convidar o dentista (recomendado)

1. **Authentication** → **Users** → **Invite user**  
2. Informe o e-mail profissional  
3. O convidado recebe um e-mail do Supabase  
4. Ao clicar no link, cai em `/auth/callback` e entra na sessão  
5. Se precisar definir senha: use **Esqueceu a senha?** no login, ou em **Users** → o usuário → reset  

No primeiro login bem-sucedido, o app cria `profile`/`settings` e faz seed dos serviços padrão.

### 3. Alternativa: criar usuário com senha

1. **Authentication** → **Users** → **Add user** → **Create new user**  
2. E-mail + senha  
3. Marque e-mail como confirmado, se a opção existir  
4. Acesse `/login` com essas credenciais  

Útil em desenvolvimento sem depender de e-mail.

### 4. URLs de Auth (local)

**Authentication** → **URL Configuration**:

- Site URL: `http://localhost:3000`  
- Redirect URLs: `http://localhost:3000/auth/callback`  

---

## Deploy na Vercel (produção)

### A. Repositório

1. Suba o código no GitHub (**sem** `.env.local`)  
2. Confirme com `git status` que nenhum arquivo de segredo está staged  

### B. Projeto na Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importe o repo  
2. Framework: Next.js (detectado)  
3. **Environment Variables** (Production + Preview, se quiser):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `DATABASE_URL` | Connection string **pooler** (Transaction, porta 6543) |
| `NEXT_PUBLIC_APP_URL` | `https://seu-app.vercel.app` (ou domínio próprio) |

4. Deploy  

### C. Auth no Supabase para produção

**Authentication** → **URL Configuration**:

- Site URL: `https://seu-app.vercel.app`  
- Redirect URLs (adicione **todas** as usadas):
  - `https://seu-app.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (se ainda desenvolver local)

**Providers → Email**:

- Signups **desabilitados**  
- Confirm email: recomendado **ligado** em produção  

### D. Domínio próprio (opcional)

1. Vercel → Project → **Domains** → adicione `agenda.suaclinica.com.br`  
2. Ajuste DNS conforme a Vercel indicar  
3. Atualize `NEXT_PUBLIC_APP_URL` e as Redirect URLs do Supabase para o domínio novo  
4. Redeploy  

### E. Checklist pós-deploy

- [ ] Abrir a URL da Vercel → cai em `/login`  
- [ ] Invite ou usuário criado → login funciona  
- [ ] Não há botão “Criar conta”  
- [ ] Agenda / pacientes / serviços carregam  
- [ ] Security Advisor do Supabase sem críticos  

### F. Segurança rápida

- Nunca coloque `service_role` ou senha do banco em variável `NEXT_PUBLIC_`  
- Se a senha do DB já vazou, troque em **Database → Settings**  
- Signup desligado no Dashboard **e** no app (já feito no código)  

---

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run db:push` | Push do schema (dev) |
| `npm run db:seed` | Seed de serviços (`USER_ID` obrigatório) |

## Rotas

| Rota | Conteúdo |
|---|---|
| `/login` | Login + recuperação (sem signup) |
| `/agenda` | Dia / Semana / Lista |
| `/pacientes` | CRUD + histórico |
| `/servicos` | Catálogo |
| `/painel` | Resumo diário/mensal |
| `/configuracoes` | Clínica, horários, bloqueios |
