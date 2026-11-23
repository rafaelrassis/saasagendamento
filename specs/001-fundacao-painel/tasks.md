---
description: "Task list for 001 Fundação e Painel do Profissional"
---

# Tasks: Fundação e Painel do Profissional

**Input**: Design documents from `/specs/001-fundacao-painel/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: incluídos. A spec exige verificação automatizada em SC-003 (cálculo de
disponibilidade) e SC-004 (isolamento multi-tenant), e o plano define Vitest.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos distintos, sem dependência pendente)
- **[Story]**: a qual user story a tarefa pertence (US1..US4)

## Path Conventions

Projeto único: `src/`, `prisma/`, `tests/` na raiz do repositório, conforme a
Structure Decision do `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: projeto de pé, com verificação automatizada funcionando desde o primeiro
commit — crítico porque o desenvolvimento é por celular e não há inspeção manual local.

- [ ] T001 Inicializar projeto Next.js 15 com App Router e TypeScript na raiz do repositório, preservando `.specify/`, `.claude/`, `specs/`, `docs/` e `README.md`
- [ ] T002 Configurar Tailwind CSS 4 em `src/app/globals.css` e `postcss.config.mjs`, com viewport mobile-first em `src/app/layout.tsx`
- [ ] T003 [P] Configurar ESLint e Prettier em `eslint.config.mjs` e `.prettierrc`
- [ ] T004 [P] Configurar Vitest em `vitest.config.ts` com ambiente node e alias `@/` para `src/`
- [ ] T005 [P] Criar workflow de CI em `.github/workflows/ci.yml` rodando `npm ci`, `npm run build` e `npx vitest run` em push e pull request na `main`
- [ ] T006 Instalar e configurar Prisma 6 em `prisma/schema.prisma` com datasource PostgreSQL lendo `DATABASE_URL` e `DIRECT_URL`
- [ ] T007 [P] Criar `.env.example` com as variáveis listadas em `quickstart.md`, sem valores reais
- [ ] T008 [P] Documentar scripts de `package.json`: `dev`, `build`, `test`, `db:migrate`, `db:seed`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: modelo de dados completo e as garantias de integridade que a constituição
exige. Nenhuma user story pode começar antes disto.

**⚠️ CRITICAL**: T011 e T012 são as tarefas que materializam os princípios I e III. Sem
elas a feature não está pronta, independentemente do que a interface mostre.

- [ ] T009 Escrever o schema completo das 13 entidades em `prisma/schema.prisma` conforme `data-model.md`, incluindo as entidades dormentes (Customer, Purchase, SessionLedger, Appointment, WaConversation, ScheduledMessage, WebhookEvent) e os enums Vertical, ProStatus, PackageKind, BillingInterval, PurchaseStatus, LedgerReason, ApptStatus, MsgStatus
- [ ] T010 Gerar a migration inicial em `prisma/migrations/` e verificar que aplica em banco vazio
- [ ] T011 Adicionar SQL cru à migration inicial criando a extensão `btree_gist` e a constraint `appointment_no_overlap` em `Appointment` (`EXCLUDE USING gist` sobre `professionalId` e `tstzrange(startsAt, endsAt, '[)')`, restrita a `status IN ('SCHEDULED','DONE')`), conforme a seção "Restrições que o Prisma não expressa" de `data-model.md`
- [ ] T012 Adicionar SQL cru à migration inicial criando a função `session_ledger_append_only()` e o trigger `session_ledger_no_mutation` que bloqueia UPDATE e DELETE em `SessionLedger`, conforme `data-model.md`
- [ ] T013 [P] Criar cliente Prisma singleton em `src/lib/db.ts`, evitando múltiplas instâncias em hot reload
- [ ] T014 Criar helper de tenant em `src/lib/tenant.ts` que resolve o profissional a partir da sessão e lança erro se ausente; nenhuma Server Action pode aceitar `professionalId` vindo do cliente (FR-027)
- [ ] T015 [P] Criar componentes de UI base em `src/components/ui/`: Button, Input, Select, Card, Sheet, Dialog — mobile-first, sem biblioteca externa, conforme decisão em `research.md`
- [ ] T016 [P] Criar dicionário de rótulos por vertical em `src/lib/vertical.ts`, com termos de barbearia para `BARBERSHOP`, atendendo FR-008 e o princípio IX
- [ ] T017 [P] Criar rota de cron stub em `src/app/api/cron/route.ts` protegida por comparação com `CRON_SECRET`, sem lógica de negócio
- [ ] T018 Criar seed de desenvolvimento em `prisma/seed.ts`: 1 profissional, 3 serviços, disponibilidade de segunda a sábado e 1 pacote de 4 sessões
- [ ] T019 Criar teste de integração em `tests/integration/db-constraints.test.ts` que confirma a existência de `appointment_no_overlap` em `pg_constraint` e de `session_ledger_no_mutation` em `pg_trigger`, e que tentativa de UPDATE em `SessionLedger` falha (SC-005)

**Checkpoint**: `npm run build` e `npx vitest run` verdes, migration aplicada, seed rodando.

---

## Phase 3: User Story 1 — Acesso sem senha e identidade (Priority: P1)

**Goal**: o profissional entra por link de e-mail, sem senha, e reserva seu slug público.

**Independent Test**: criar conta com um e-mail, sair, entrar novamente pelo link e
encontrar o perfil preenchido.

- [ ] T020 [US1] Instalar Auth.js v5 e adicionar os modelos do adapter Prisma (Account, Session, VerificationToken) a `prisma/schema.prisma`, com migration
- [ ] T021 [US1] Configurar Auth.js em `src/lib/auth.ts` com provider de e-mail via Resend, adapter Prisma, e sessão por cookie
- [ ] T022 [US1] Criar handler em `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T023 [P] [US1] Criar tela de solicitação de acesso em `src/app/(auth)/entrar/page.tsx` com campo de e-mail
- [ ] T024 [P] [US1] Criar tela de aviso de link enviado em `src/app/(auth)/verificar/page.tsx`
- [ ] T025 [US1] Garantir emissão de link de uso único com expiração e invalidação do link anterior do mesmo e-mail (FR-002), validando o comportamento padrão do Auth.js e ajustando a configuração se necessário
- [ ] T026 [P] [US1] Criar normalização e validação de slug em `src/lib/slug.ts`, com a lista de reservados definida em `research.md` (api, entrar, verificar, painel, admin, app, sobre, ajuda, termos, privacidade, _next, static)
- [ ] T027 [P] [US1] Criar schema Zod de perfil em `src/schemas/perfil.ts` validando nome, telefone, slug, timezone, e os parâmetros `defaultValidityDays` e `cancelWindowHours` citados em `data-model.md` (`Professional.defaultValidityDays`, `Professional.cancelWindowHours`)
- [ ] T028 [US1] Criar shell do painel autenticado em `src/app/(painel)/layout.tsx` com navegação mobile e redirecionamento para `entrar` quando sem sessão
- [ ] T029 [US1] Implementar guarda de perfil incompleto no layout do painel: profissional com `Professional.status` igual a `ONBOARDING` (ver `data-model.md`) é levado a `perfil` antes de qualquer outra área (FR-005)
- [ ] T030 [US1] Criar tela de perfil em `src/app/(painel)/perfil/page.tsx` com nome, telefone, slug, fuso horário e parâmetros de pacote
- [ ] T031 [US1] Criar Server Actions de perfil em `src/actions/perfil.ts`, resolvendo o profissional por `src/lib/tenant.ts`, aplicando os defaults de `Professional.timezone` e `Professional.vertical` de `data-model.md`, e traduzindo violação do unique de `Professional.slug`, `Professional.phone` e `Professional.email` em mensagem de usuário (FR-006)
- [ ] T032 [US1] Promover `Professional.status` de `ONBOARDING` para `ACTIVE` quando nome, telefone e slug estiverem preenchidos
- [ ] T033 [P] [US1] Criar teste unitário em `tests/unit/slug.test.ts` cobrindo normalização, acento, espaço, maiúscula, caractere especial e termo reservado
- [ ] T034 [US1] Criar teste de integração em `tests/integration/tenant-isolation.test.ts` verificando que cada Server Action de perfil, chamada com a sessão de um profissional, não alcança dado de outro (SC-004)

**Checkpoint**: entrada e saída funcionando, perfil persistido, slug único garantido pelo banco.

---

## Phase 4: User Story 2 — Catálogo de serviços (Priority: P2)

**Goal**: o profissional cadastra o que oferece, com duração e preço.

**Independent Test**: cadastrar três serviços, editar o preço de um, desativar outro, e
verificar que o desativado não é selecionável mas continua existindo.

- [ ] T035 [P] [US2] Criar schema Zod em `src/schemas/servico.ts` recusando duração não positiva e preço negativo, citando `data-model.md` (`Service.durationMin`, `Service.priceCents`) — FR-010
- [ ] T036 [US2] Criar Server Actions em `src/actions/servicos.ts` para criar, editar, desativar e reativar serviço, sempre filtrando por tenant
- [ ] T037 [US2] Implementar regra de desativação em vez de exclusão: serviço referenciado por `PackageItem` não pode ser excluído, apoiado no `onDelete: Restrict` de `PackageItem.service` em `data-model.md` (FR-011)
- [ ] T038 [US2] Criar tela de serviços em `src/app/(painel)/servicos/page.tsx` com lista, formulário e alternância de `Service.active` conforme `data-model.md`
- [ ] T039 [P] [US2] Criar teste de integração em `tests/integration/servicos.test.ts` cobrindo validação de duração e preço, desativação, e tentativa de exclusão de serviço em uso
- [ ] T040 [US2] Estender `tests/integration/tenant-isolation.test.ts` para as actions de serviço

**Checkpoint**: catálogo completo e isolado por profissional.

---

## Phase 5: User Story 3 — Quando o profissional atende (Priority: P3)

**Goal**: disponibilidade semanal e bloqueios pontuais, com cálculo correto de faixas livres.

**Independent Test**: definir atendimento de segunda a sábado, inserir almoço e férias, e
verificar as faixas livres resultantes de uma data futura.

- [ ] T041 [P] [US3] Criar schema Zod em `src/schemas/disponibilidade.ts` validando `Availability.weekday` no intervalo 0 a 6 e `Availability.startTime`/`Availability.endTime` no formato `HH:MM` conforme `data-model.md`, recusando faixa cuja hora final não seja posterior à inicial (FR-014) e faixa que atravesse a meia-noite (FR-015)
- [ ] T042 [P] [US3] Criar schema Zod em `src/schemas/bloqueio.ts` validando que `TimeBlock.endsAt` é posterior a `TimeBlock.startsAt` conforme `data-model.md` (FR-017)
- [ ] T043 [US3] Implementar o cálculo de faixas livres em `src/lib/disponibilidade.ts`: disponibilidade semanal da data menos a união dos bloqueios, convertendo entre o fuso de `Professional.timezone` e UTC com `date-fns-tz` (FR-018, FR-019)
- [ ] T044 [US3] Criar Server Actions em `src/actions/disponibilidade.ts` para definir, listar e remover faixas, recusando sobreposição no mesmo dia da semana (FR-014)
- [ ] T045 [US3] Criar Server Actions em `src/actions/bloqueios.ts` para criar, listar e remover bloqueios, aceitando sobreposição entre bloqueios (FR-019)
- [ ] T046 [US3] Criar tela de agenda em `src/app/(painel)/agenda/page.tsx` com a grade semanal de faixas e a lista de bloqueios, usável em 360 px (SC-002)
- [ ] T047 [US3] Criar teste unitário em `tests/unit/disponibilidade.test.ts` cobrindo bloqueio parcial, bloqueio total do dia, bloqueios sobrepostos, bloqueio fora de qualquer faixa, dia sem atendimento, e data com duas faixas no mesmo dia (SC-003)
- [ ] T048 [P] [US3] Criar teste unitário em `tests/unit/disponibilidade-fuso.test.ts` verificando que troca de `Professional.timezone` preserva os números de hora local das faixas e altera o resultado em UTC
- [ ] T049 [US3] Estender `tests/integration/tenant-isolation.test.ts` para as actions de disponibilidade e bloqueio

**Checkpoint**: cálculo de disponibilidade correto e coberto por teste — a única regra com complexidade real da feature.

---

## Phase 6: User Story 4 — Pacotes e assinaturas (Priority: P4)

**Goal**: o profissional publica o que vende antecipadamente.

**Independent Test**: criar um pacote avulso de 4 sessões e uma assinatura mensal com dois
serviços, e verificar a composição de ambos.

- [ ] T050 [P] [US4] Criar schema Zod em `src/schemas/pacote.ts` validando nome, `Package.kind`, preço, `Package.validityDays` e itens, recusando `PackageItem.quantity` não positiva conforme `data-model.md` (FR-022)
- [ ] T051 [US4] Criar Server Actions em `src/actions/pacotes.ts` para criar, editar, ativar e desativar pacote e gerenciar sua composição, respeitando o `@@unique([packageId, serviceId])` de `PackageItem` em `data-model.md`
- [ ] T052 [US4] Implementar a regra de ativação: `Package.active` nasce `false` conforme `data-model.md` e só pode virar `true` com ao menos um `PackageItem` válido (FR-022)
- [ ] T053 [US4] Aplicar `Professional.defaultValidityDays` como `Package.validityDays` quando a validade não for informada, conforme `data-model.md` (FR-023)
- [ ] T054 [US4] Registrar `Package.billingInterval` como `MONTHLY` quando `Package.kind` for `SUBSCRIPTION`, conforme `data-model.md` (FR-024)
- [ ] T055 [US4] Implementar alerta ao desativar serviço que compõe pacote ativo, nas actions de serviço e pacote (FR-025)
- [ ] T056 [US4] Criar tela de pacotes em `src/app/(painel)/pacotes/page.tsx` com lista, formulário e editor de composição
- [ ] T057 [P] [US4] Criar teste de integração em `tests/integration/pacotes.test.ts` cobrindo ativação sem itens, quantidade inválida, validade default, intervalo de assinatura e alerta de dependência
- [ ] T058 [US4] Estender `tests/integration/tenant-isolation.test.ts` para as actions de pacote

**Checkpoint**: o profissional tem algo publicável à venda. Fim do escopo da feature.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T059 [P] Revisar todas as telas em 360 px de largura e corrigir rolagem horizontal (SC-002)
- [ ] T060 [P] Padronizar tratamento de erro de Server Action em `src/lib/errors.ts`, com tradução de violação de constraint do PostgreSQL em mensagem de usuário
- [ ] T061 [P] Adicionar estados de carregamento e vazio em cada tela do painel
- [ ] T062 Executar o percurso completo de SC-001 pelo celular num deploy de preview, cronometrando: conta, perfil, três serviços, disponibilidade, bloqueio e pacote publicado em menos de 10 minutos
- [ ] T063 [P] Verificar com `npx prisma migrate diff` que o schema aplicado corresponde a `prisma/schema.prisma` (SC-006)
- [ ] T064 Confirmar que nenhuma dependência de gateway de pagamento ou de WhatsApp entrou no `package.json` (princípios VI e X)
- [ ] T065 Confirmar que nenhum termo de nicho ("barbeiro", "corte", "barbearia") aparece em tabela, coluna, enum ou rota (princípio IX)

---

## Dependencies

```
Phase 1 (Setup)
   ↓
Phase 2 (Foundational) ──── T011 e T012 são obrigatórias, não opcionais
   ↓
Phase 3 (US1) ──── bloqueia todas as demais: sem sessão não há tenant
   ↓
   ├── Phase 4 (US2) ──┐
   │                   ↓
   │              Phase 6 (US4) ── depende de US2: pacote é composto de serviços
   │
   └── Phase 5 (US3) ── independente de US2 e US4
   ↓
Phase 7 (Polish)
```

- **US1 bloqueia tudo**: nenhuma outra story funciona sem profissional autenticado.
- **US2 bloqueia US4**: não há como compor pacote sem serviço cadastrado.
- **US3 é independente** de US2 e US4: pode ser feita em paralelo a elas após US1.

## Parallel Execution

**Dentro da Phase 1**: T003, T004, T005, T007, T008 em paralelo após T001 e T002.

**Dentro da Phase 2**: T013, T015, T016, T017 em paralelo após T010. T011 e T012 são
sequenciais sobre a mesma migration.

**Dentro da Phase 3**: T023, T024, T026, T027 em paralelo após T022. T033 em paralelo a
partir de T026.

**Entre phases**: Phase 5 (US3) pode rodar em paralelo a Phase 4 (US2) depois que a
Phase 3 fechar, porque não compartilham arquivo algum.

## Implementation Strategy

**MVP mínimo demonstrável**: Phase 1 + Phase 2 + Phase 3 (US1). Entrega um profissional
que cria conta, entra sem senha e reserva seu endereço público. Já é demonstrável a um
barbeiro.

**Primeiro incremento vendável**: adicionar Phase 4 (US2) e Phase 6 (US4). Com catálogo e
pacote publicado, existe produto — falta apenas o meio de cobrar, que é a feature 002.

**Ordem recomendada por sessão de trabalho**, dado que o desenvolvimento é por celular e
uma sessão é curta:

1. Sessão A: Phase 1 + Phase 2 até T012, commit
2. Sessão B: Phase 2 restante + checkpoint verde, commit
3. Sessão C: Phase 3 (US1), commit
4. Sessão D: Phase 4 (US2), commit
5. Sessão E: Phase 5 (US3) — a mais densa, pelo cálculo de disponibilidade, commit
6. Sessão F: Phase 6 (US4), commit
7. Sessão G: Phase 7, commit

Commit e push na `main` ao fim de cada sessão. O ambiente não persiste.
