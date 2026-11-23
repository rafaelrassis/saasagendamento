# Implementation Plan: Fundação e Painel do Profissional

**Branch**: `001-fundacao-painel` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fundacao-painel/spec.md`

## Summary

Entregar a base do sistema: modelo de dados completo em PostgreSQL, acesso do
profissional por magic link sem senha, e o painel mobile-first onde ele cadastra
serviços, define disponibilidade e bloqueios, e publica pacotes.

A abordagem é um único projeto Next.js App Router com mutação por Server Actions,
sem camada REST interna. O modelo de dados nasce completo — inclusive as entidades
das features 002 a 004 — para que a migration inicial já carregue as restrições de
integridade que a constituição exige, em especial a exclusão de agendamentos
sobrepostos, que precisa de extensão PostgreSQL e é caro de adicionar depois.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 22 LTS

**Primary Dependencies**: Next.js 15 (App Router), Prisma 6, Auth.js v5 (`next-auth`)
com provider de e-mail, Zod para validação de entrada, Tailwind CSS 4,
`date-fns` + `date-fns-tz` para fuso horário

**Storage**: PostgreSQL gerenciado na Neon. Extensão `btree_gist` obrigatória.

**Testing**: Vitest para unidade e integração. Sem e2e nesta feature.

**Target Platform**: Web, servido pela Vercel. Navegador móvel é o alvo primário.

**Project Type**: Aplicação web em projeto único.

**Performance Goals**: cálculo de faixas livres de uma data em menos de 50 ms para um
profissional com disponibilidade completa e até 100 bloqueios no período. Resposta de
página do painel em menos de 1 s em 4G.

**Constraints**: todas as telas utilizáveis em 360 px de largura sem rolagem
horizontal. Nenhuma verificação pode depender de servidor local de longa duração —
o ambiente de desenvolvimento é uma sessão remota efêmera operada por celular.

**Scale/Scope**: dezenas de profissionais e alguns milhares de clientes no primeiro
ano. 4 áreas de painel, cerca de 12 Server Actions, 13 tabelas.

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após o desenho.*

| Princípio | Como este plano atende |
|---|---|
| I. Ledger imutável | `SessionLedger` criado sem coluna de saldo. Nenhuma escrita nesta feature. Saldo será função de agregação, nunca campo |
| II. Idempotência | `WebhookEvent` com unique `(provider, externalId)` e `SessionLedger.idempotencyKey` unique já na migration inicial |
| III. Atomicidade | Constraint `EXCLUDE USING gist` em `Appointment` criada na migration inicial via SQL cru, com `btree_gist` habilitada |
| IV. UTC | Colunas `timestamptz`. `Availability` guarda hora local como texto `HH:MM` por ser recorrência semanal, não instante. Conversão por `date-fns-tz` na borda |
| V. Não custodiar dinheiro | Nenhum fluxo de pagamento nesta feature. `providerAccountId` existe e permanece nulo |
| VI. Pagamento atrás de interface | `lib/payments/` não é criado nesta feature. Nenhuma dependência de gateway no `package.json` |
| VII. WhatsApp | Nenhum envio nesta feature. `Customer.lastInboundAt` existe no schema para a regra de janela futura |
| VIII. Multi-tenant | `professionalId` obrigatório em toda tabela de domínio. Helper único de sessão resolve o profissional; nenhuma Server Action aceita `professionalId` vindo do cliente |
| IX. Neutralidade de vertical | Schema sem termo de nicho. Enum `Vertical` com default `BARBERSHOP`. Rótulos de nicho ficam em dicionário de apresentação |
| X. Simplicidade | Sem fila, sem Redis, sem worker. Componentes de UI próprios em vez de biblioteca de componentes, para reduzir superfície de revisão em tela de celular |

Sem violações. Seção de Complexity Tracking omitida.

## Decisões técnicas

**Auth.js v5 com provider de e-mail, não implementação própria.** Magic link
envolve token de uso único, expiração, invalidação do anterior e cookie de sessão —
tudo já resolvido e auditado no Auth.js, com adapter Prisma. Implementar à mão é
superfície de segurança sem ganho.

**Resend como provedor de e-mail transacional.** Free tier cobre o volume de
desenvolvimento e dos primeiros profissionais, a integração é uma chamada HTTP e o
domínio pode ser verificado depois. Alternativa rejeitada: SMTP genérico, que exige
configuração de reputação e cai em spam no início.

**Neon em vez de Supabase.** O diferencial decisivo é branch de banco por deploy de
preview: como a verificação visual acontece no preview da Vercel e não em localhost,
cada preview ganha um banco isolado sem trabalho manual.

**Tailwind com componentes próprios, sem biblioteca de componentes.** Mobile-first
pede poucos componentes bem feitos. Uma biblioteca traria dezenas de arquivos que
precisariam ser revisados numa tela de celular, violando o princípio de simplicidade
sem resolver um problema real nesta feature.

**`Availability` guarda `HH:MM` como texto.** É recorrência semanal em hora local do
profissional, não um instante no tempo. Persistir como `timestamptz` exigiria uma data
fictícia e quebraria ao trocar o fuso. Instantes reais (`TimeBlock`, `Appointment`)
são `timestamptz` em UTC, conforme o princípio IV.

**Unicidade de slug por constraint de banco, não por verificação prévia.** Duas
requisições simultâneas passariam por um `SELECT` de verificação. O unique index é o
árbitro, e o erro de violação é traduzido em mensagem ao usuário.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacao-painel/
├── plan.md              # Este arquivo
├── spec.md              # Especificação funcional
├── data-model.md        # Schema e restrições de banco
├── research.md          # Decisões técnicas e alternativas rejeitadas
├── quickstart.md        # Setup do ambiente e verificação
└── tasks.md             # Gerado por /speckit-tasks
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma
├── migrations/
└── seed.ts

src/
├── app/
│   ├── (auth)/
│   │   ├── entrar/page.tsx              # solicitar magic link
│   │   └── verificar/page.tsx           # aviso de link enviado
│   ├── (painel)/
│   │   ├── layout.tsx                   # shell autenticado, navegação mobile
│   │   ├── perfil/page.tsx              # nome, telefone, slug, fuso, parâmetros
│   │   ├── servicos/page.tsx
│   │   ├── agenda/page.tsx              # disponibilidade semanal + bloqueios
│   │   └── pacotes/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── cron/route.ts                # stub protegido por CRON_SECRET
│   └── layout.tsx
├── actions/
│   ├── perfil.ts
│   ├── servicos.ts
│   ├── disponibilidade.ts
│   ├── bloqueios.ts
│   └── pacotes.ts
├── lib/
│   ├── auth.ts                          # config do Auth.js
│   ├── db.ts                            # cliente Prisma singleton
│   ├── tenant.ts                        # resolve o profissional da sessão
│   ├── slug.ts                          # normalização e lista de reservados
│   ├── disponibilidade.ts               # cálculo de faixas livres
│   └── vertical.ts                      # dicionário de rótulos por vertical
├── components/
│   └── ui/                              # Button, Input, Select, Card, Sheet, Dialog
└── schemas/                             # schemas Zod por área

tests/
├── unit/
│   ├── disponibilidade.test.ts
│   └── slug.test.ts
└── integration/
    ├── tenant-isolation.test.ts
    └── pacotes.test.ts
```

**Structure Decision**: projeto único. Não há backend separado: Server Actions
atendem toda a mutação e o acesso a dados roda no servidor do próprio Next.js. A
pasta `actions/` concentra mutação por área de domínio, e `lib/` guarda a lógica pura
testável — notadamente o cálculo de disponibilidade, que é a única regra com
complexidade real nesta feature.

## Fases

**Fase 0 — Fundação.** Projeto Next.js, Tailwind, Prisma apontando para Neon, schema
completo, migration inicial com `btree_gist` e a constraint de exclusão, seed de
desenvolvimento, deploy na Vercel com preview funcionando, rota de cron stub.

**Fase 1 — Acesso.** Auth.js com Resend, adapter Prisma, telas de entrada, shell do
painel, helper de tenant, guarda de perfil incompleto, tela de perfil com slug e
parâmetros.

**Fase 2 — Catálogo.** Serviços, com validação Zod e regra de desativação em vez de
exclusão.

**Fase 3 — Agenda.** Disponibilidade semanal, bloqueios, e o módulo de cálculo de
faixas livres com sua bateria de testes.

**Fase 4 — Pacotes.** Pacotes, composição, parâmetros de validade, alerta de
dependência ao desativar serviço.

Cada fase termina em commit e push na `main`, com `npm run build` e `vitest` verdes.

## Verificação

Não há servidor local de longa duração. A verificação de cada fase é:

1. `npm run build` sem erro
2. `vitest run` verde
3. `npx prisma migrate diff` confirmando que o schema aplicado corresponde ao arquivo
4. deploy de preview na Vercel aberto no celular para conferência visual

Teste de isolamento multi-tenant é obrigatório na Fase 1 e reexecutado ao fim de cada
fase seguinte: cada Server Action é chamada com sessão de um profissional tentando
alcançar dado de outro, e deve falhar.
