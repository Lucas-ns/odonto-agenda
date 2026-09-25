# PRD — Agenda Odonto (Web App de Agendamento Odontológico)

> **Status:** Rascunho v0.1
> **Última atualização:** 25/09/2026
> **Responsável:** Lucas Silva

Este documento é vivo: atualize os checklists do roadmap (seção 12) e o changelog (seção 15) conforme o projeto avançar.

---

## 1. Visão geral

Web app responsivo para o **próprio dentista** gerenciar sua agenda: cadastrar pacientes, marcar consultas e selecionar os serviços realizados, com **valores pré-preenchidos** a partir de um catálogo de serviços. Deve funcionar bem em PC, tablet e celular e ser hospedado na **Vercel** usando **Next.js**.

### 1.1 Problema
Agendas em papel, planilhas ou apps genéricos não associam serviços e valores à consulta, dificultam a visualização da semana no celular e não geram um histórico financeiro simples por paciente.

### 1.2 Objetivo
Permitir que o dentista marque uma consulta completa (paciente + data/hora + serviços + valor) em **menos de 30 segundos**, em qualquer dispositivo.

### 1.3 Não é objetivo (fora do escopo do MVP)
- Autoagendamento pelo paciente (portal público).
- Prontuário clínico completo, odontograma ou anexos de exames.
- Emissão de nota fiscal, integração com convênios ou gateways de pagamento.
- Múltiplos profissionais / clínicas (multi-tenant).

---

## 2. Persona

**Dr(a). Dentista — operador único**
- Atende sozinho(a) ou com pouco apoio de secretaria.
- Usa o celular entre atendimentos e o PC/tablet no consultório.
- Precisa de rapidez, poucos cliques e visão clara do dia/semana.
- Quer saber quanto faturou no dia/mês sem montar planilhas.

---

## 3. Métricas de sucesso

| Métrica | Meta |
|---|---|
| Tempo para criar um agendamento | < 30 s |
| Carregamento da agenda (4G) | < 2 s (LCP) |
| Lighthouse (mobile) Performance / Acessibilidade | ≥ 90 / ≥ 90 |
| Agendamentos conflitantes criados sem aviso | 0 |

---

## 4. Escopo do MVP — Requisitos funcionais

Prioridade: **P0** = obrigatório no MVP, **P1** = desejável no MVP, **P2** = pós-MVP.

### 4.1 Autenticação
| ID | Requisito | Prioridade |
|---|---|---|
| AUTH-01 | Login do dentista com e-mail e senha (ou magic link). | P0 |
| AUTH-02 | Todas as rotas do app protegidas; sem acesso público aos dados. | P0 |
| AUTH-03 | Sessão persistente no dispositivo ("lembrar de mim"). | P1 |
| AUTH-04 | Recuperação de senha. | P1 |

### 4.2 Catálogo de serviços
| ID | Requisito | Prioridade |
|---|---|---|
| SRV-01 | CRUD de serviços: nome, valor padrão (R$), duração padrão (min), categoria opcional, cor opcional. | P0 |
| SRV-02 | Desativar serviço sem apagar (preserva histórico). | P0 |
| SRV-03 | Busca/filtro de serviços por nome. | P1 |
| SRV-04 | Seed inicial com serviços comuns (limpeza, restauração, extração, clareamento, canal, avaliação). | P1 |

### 4.3 Pacientes
| ID | Requisito | Prioridade |
|---|---|---|
| PAC-01 | CRUD de pacientes: nome (obrigatório), telefone/WhatsApp, e-mail, data de nascimento, CPF (opcional), observações. | P0 |
| PAC-02 | Busca rápida por nome ou telefone (autocomplete no agendamento). | P0 |
| PAC-03 | Cadastro rápido de paciente direto na tela de agendamento (só nome + telefone). | P0 |
| PAC-04 | Histórico do paciente: consultas passadas/futuras, serviços e valores. | P1 |
| PAC-05 | Botão "Abrir no WhatsApp" (link `wa.me`). | P1 |

### 4.4 Agenda e agendamentos
| ID | Requisito | Prioridade |
|---|---|---|
| AGD-01 | Visualizações **Dia**, **Semana** e **Lista**; no celular, padrão = Dia/Lista. | P0 |
| AGD-02 | Criar agendamento: paciente, data, hora de início, um ou mais serviços, observações. | P0 |
| AGD-03 | Ao adicionar serviços, **valor e duração são pré-preenchidos** a partir do catálogo; a duração total define o horário de término. | P0 |
| AGD-04 | Valor de cada item e desconto podem ser **editados** no agendamento; total recalculado automaticamente. | P0 |
| AGD-05 | O preço é **copiado** para o agendamento (snapshot): alterar o catálogo não muda consultas já criadas. | P0 |
| AGD-06 | Detecção de **conflito de horário** com aviso (permitir forçar encaixe com confirmação). | P0 |
| AGD-07 | Status do agendamento: `agendado`, `confirmado`, `concluído`, `faltou`, `cancelado`. | P0 |
| AGD-08 | Editar, remarcar e cancelar agendamento. | P0 |
| AGD-09 | Toque/clique num horário vazio abre o formulário já com data/hora preenchidas. | P1 |
| AGD-10 | Arrastar e soltar para remarcar (desktop/tablet). | P2 |
| AGD-11 | Configurar horário de atendimento (dias da semana, início/fim, intervalo de almoço). | P1 |
| AGD-12 | Bloqueios de agenda (férias, compromissos). | P1 |
| AGD-13 | Registrar pagamento: status (`pendente`, `pago`, `parcial`) e forma (Pix, dinheiro, cartão). | P1 |

### 4.5 Painel / Financeiro simples
| ID | Requisito | Prioridade |
|---|---|---|
| FIN-01 | Resumo do dia: consultas, total previsto e total concluído. | P0 |
| FIN-02 | Resumo mensal: faturamento (concluídos), pendências, serviços mais realizados. | P1 |
| FIN-03 | Exportar CSV de agendamentos por período. | P2 |

### 4.6 Pós-MVP (P2)
- Lembretes automáticos (WhatsApp/e-mail) — Vercel Cron + provedor de mensagens.
- PWA instalável com suporte offline de leitura.
- Portal de autoagendamento pelo paciente.
- Múltiplos profissionais e cadeiras.
- Anexos (fotos, raio-X) via Vercel Blob.

---

## 5. Requisitos não funcionais

| Tema | Requisito |
|---|---|
| **Responsividade** | Mobile-first; breakpoints para celular (< 640px), tablet (640–1024px) e desktop (> 1024px). Alvos de toque ≥ 44px. |
| **Performance** | Server Components por padrão; carregamento parcial da agenda por intervalo de datas. |
| **Localização** | pt-BR, moeda BRL (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`), fuso `America/Sao_Paulo`. |
| **Dinheiro** | Valores armazenados em **centavos (inteiro)**, nunca float. |
| **Datas** | Armazenar em UTC (`timestamptz`); exibir no fuso local. |
| **Segurança** | HTTPS, senhas com hash, validação de entrada no servidor (Zod), proteção CSRF nas Server Actions (nativa), rate limit no login. |
| **LGPD** | Dados de saúde são **dados sensíveis**: acesso restrito ao dentista, backup do banco, possibilidade de exportar/excluir dados de um paciente, termo de consentimento simples no cadastro (P1). |
| **Acessibilidade** | Contraste AA, navegação por teclado, labels em todos os campos. |
| **Disponibilidade** | Hospedagem Vercel + banco gerenciado com backups automáticos. |

---

## 6. Stack técnica sugerida

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Components e Server Actions para CRUD. |
| UI | **Tailwind CSS + shadcn/ui** | Componentes acessíveis e fáceis de customizar. |
| Calendário | **FullCalendar** ou **react-big-calendar** (ou grade própria) | Avaliar peso no mobile; uma grade própria para "Dia/Lista" pode ser mais leve. |
| Formulários | **React Hook Form + Zod** | Mesmo schema Zod no cliente e no servidor. |
| Banco | **PostgreSQL** (Neon ou Supabase, via Vercel Marketplace) | Plano gratuito suficiente para início. |
| ORM | **Prisma** ou **Drizzle** | Drizzle é mais leve em ambientes serverless. |
| Autenticação | **Auth.js** ou **Better Auth** (ou Clerk, se preferir gerenciado) | Operador único → pode começar só com credenciais. |
| Datas | **date-fns** + **date-fns-tz** | |
| Deploy | **Vercel** | Preview deployments por branch/PR. |
| Qualidade | ESLint, Prettier, Vitest (unitário), Playwright (E2E) | |

> ⚠️ Verifique as versões atuais das bibliotecas na hora de iniciar o projeto.

---

## 7. Modelo de dados (inicial)

```text
User (dentista)
  id, name, email, password_hash, created_at

Settings
  id, user_id, clinic_name, slot_minutes (ex.: 15), timezone
  working_hours JSON  -- ex.: { "mon": [["08:00","12:00"],["13:30","18:00"]], ... }

Service
  id, user_id, name, category?, default_price_cents INT,
  default_duration_min INT, color?, active BOOL, created_at, updated_at

Patient
  id, user_id, name, phone?, email?, birth_date?, cpf?, notes?,
  consent_at?, created_at, updated_at

Appointment
  id, user_id, patient_id,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  status ENUM(scheduled, confirmed, completed, no_show, canceled),
  discount_cents INT DEFAULT 0,
  total_cents INT,              -- soma dos itens - desconto (calculado no servidor)
  payment_status ENUM(pending, paid, partial) DEFAULT pending,
  payment_method ENUM(pix, cash, credit, debit, other)?,
  notes?, created_at, updated_at

AppointmentItem   -- snapshot do serviço no momento do agendamento
  id, appointment_id, service_id?,
  service_name TEXT, price_cents INT, duration_min INT, quantity INT DEFAULT 1

ScheduleBlock
  id, user_id, starts_at, ends_at, reason?
```

**Índices importantes:** `Appointment(user_id, starts_at)`, `Patient(user_id, name)`, `Patient(user_id, phone)`.

**Regra de conflito:** existe conflito quando `novo.starts_at < existente.ends_at AND novo.ends_at > existente.starts_at`, ignorando agendamentos `canceled`.

---

## 8. Telas e fluxos

### 8.1 Mapa de rotas
```text
/login
/                      → redireciona para /agenda
/agenda                → visão Dia/Semana/Lista (?date=2026-09-25&view=day)
/agenda/novo           → formulário (modal no desktop, tela cheia no mobile)
/agenda/[id]           → detalhes / edição
/pacientes             → lista + busca
/pacientes/novo
/pacientes/[id]        → dados + histórico
/servicos              → catálogo
/painel                → resumo diário/mensal
/configuracoes         → horários de atendimento, bloqueios, dados da clínica
```

### 8.2 Navegação responsiva
- **Celular:** barra inferior com Agenda · Pacientes · Serviços · Painel + botão flutuante "+ Agendar".
- **Tablet/Desktop:** sidebar lateral fixa; agenda em visão Semana por padrão.

### 8.3 Fluxo principal — Novo agendamento
1. Toca em "+ Agendar" ou num horário vazio.
2. Busca o paciente (autocomplete) ou cria um rapidamente.
3. Data e hora (pré-preenchidas se veio do horário vazio).
4. Adiciona serviços por busca → valor e duração aparecem automaticamente.
5. Ajusta valores/desconto se necessário; vê o total e horário de término.
6. Sistema avisa se houver conflito.
7. Salva → volta para a agenda com o agendamento destacado.

### 8.4 Fluxo — Concluir atendimento
Abrir agendamento → "Concluir" → (opcional) marcar pagamento e forma → total entra no faturamento.

---

## 9. Regras de negócio

1. O total do agendamento é **sempre recalculado no servidor** a partir dos itens (não confiar no valor enviado pelo cliente).
2. Desconto não pode deixar o total negativo.
3. Serviços desativados não aparecem para novos agendamentos, mas continuam visíveis no histórico.
4. Apenas agendamentos `completed` somam no faturamento realizado; `scheduled`/`confirmed` somam no previsto.
5. Excluir paciente com histórico → exigir confirmação; preferir anonimização (LGPD) em vez de apagar agendamentos.
6. Agendamentos fora do horário de atendimento ou em bloqueios geram aviso, não bloqueio.

---

## 10. Estrutura de pastas sugerida

```text
src/
  app/
    (auth)/login/page.tsx
    (app)/layout.tsx          # shell com sidebar/bottom nav
    (app)/agenda/...
    (app)/pacientes/...
    (app)/servicos/...
    (app)/painel/page.tsx
    (app)/configuracoes/page.tsx
  components/
    ui/                       # shadcn
    agenda/ pacientes/ servicos/
  lib/
    db/ (schema, client)
    auth.ts
    money.ts                  # formatação e conversão de centavos
    dates.ts                  # helpers de fuso
    validations/              # schemas Zod
  server/
    actions/                  # Server Actions por domínio
    queries/                  # leituras
```

---

## 11. Deploy e ambientes (Vercel)

- Repositório no GitHub conectado à Vercel; `main` = produção, PRs = preview.
- Variáveis de ambiente: `DATABASE_URL`, `AUTH_SECRET`, (outras do provedor de auth).
- Banco separado para **preview/dev** e **produção** (Neon permite branches de banco).
- Migrações rodando em etapa controlada (script `db:migrate`), não automaticamente em todo build.
- Domínio próprio opcional (ex.: `agenda.suaclinica.com.br`).

---

## 12. Roadmap e checklist de andamento

### Fase 0 — Setup
- [ ] Criar projeto Next.js com TypeScript, Tailwind, ESLint
- [ ] Instalar shadcn/ui e definir tema (cores, fonte)
- [ ] Configurar banco (Neon/Supabase) e ORM
- [ ] Primeiro deploy na Vercel
- [ ] Configurar autenticação e proteger rotas

### Fase 1 — Cadastros
- [ ] CRUD de serviços (com valor em centavos e duração)
- [ ] Seed de serviços iniciais
- [ ] CRUD de pacientes + busca
- [ ] Layout responsivo (sidebar / bottom nav)

### Fase 2 — Agenda (núcleo do MVP)
- [ ] Visão Dia e Lista (mobile)
- [ ] Visão Semana (tablet/desktop)
- [ ] Formulário de agendamento com múltiplos serviços pré-preenchidos
- [ ] Snapshot de preço/duração nos itens
- [ ] Cálculo de total e horário de término
- [ ] Detecção de conflito
- [ ] Status e edição/remarcação/cancelamento

### Fase 3 — Painel e ajustes
- [ ] Resumo do dia
- [ ] Resumo mensal
- [ ] Registro de pagamento
- [ ] Horários de atendimento e bloqueios
- [ ] Histórico do paciente + link WhatsApp

### Fase 4 — Qualidade e lançamento
- [ ] Testes unitários (money, dates, conflito, total)
- [ ] Testes E2E do fluxo de agendamento (Playwright)
- [ ] Auditoria Lighthouse mobile
- [ ] Revisão LGPD (consentimento, exportação/exclusão)
- [ ] Backup do banco verificado
- [ ] Uso real por 1 semana e coleta de feedback

### Fase 5 — Pós-MVP
- [ ] PWA instalável
- [ ] Lembretes automáticos
- [ ] Exportação CSV
- [ ] Arrastar e soltar na agenda

---

## 13. Critérios de aceite do MVP

- [ ] Dentista faz login no celular e no PC e vê a mesma agenda.
- [ ] Cria um agendamento com 2+ serviços e o total aparece correto sem digitar valores.
- [ ] Alterar o preço de um serviço **não** altera agendamentos já existentes.
- [ ] Tentar marcar em horário ocupado exibe aviso.
- [ ] Marcar como concluído reflete no resumo do dia.
- [ ] Todas as telas utilizáveis em 360px de largura sem rolagem horizontal.

---

## 14. Riscos e questões em aberto

| # | Questão / Risco | Decisão |
|---|---|---|
| 1 | Haverá secretária usando o sistema? (impacta perfis de acesso) | _a definir_ |
| 2 | Precisa de lembretes por WhatsApp já no MVP? | _a definir_ |
| 3 | Biblioteca de calendário pronta vs. grade própria (peso x esforço) | _a definir_ |
| 4 | Guardar CPF é necessário? (minimizar dados sensíveis — LGPD) | _a definir_ |
| 5 | Tratamentos em várias sessões (ex.: canal, ortodontia) — vincular consultas a um "plano de tratamento"? | _pós-MVP?_ |
| 6 | Custos: plano gratuito da Vercel (Hobby) é para uso não comercial; avaliar plano Pro para uso profissional | _verificar termos atuais_ |

---

## 15. Changelog do documento

| Data | Versão | Alteração |
|---|---|---|
| 25/09/2026 | 0.1 | Criação do PRD inicial |
