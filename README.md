# saasagendamento

Plataforma onde o profissional autônomo vende **pacotes e assinaturas de serviços
antecipadamente**, e o cliente final compra, agenda e remarca **inteiramente pelo
WhatsApp**.

Não é um sistema de agenda. A agenda existe porque pacote vendido precisa ser
consumido. A dor que o produto resolve é **previsibilidade de receita** para quem vive
de fluxo diário.

Primeira vertical: barbearia. O núcleo é neutro e atende manicure e estética sem
alteração de schema.

## Como este repositório é organizado

O desenvolvimento segue **Spec-Driven Development** com [Spec Kit](https://github.com/github/spec-kit).

| Caminho | O que é |
|---|---|
| `.specify/memory/constitution.md` | Os princípios invioláveis do projeto. Vence qualquer spec |
| `docs/produto.md` | Decisões de produto e negócio. Não é gerado pelo Spec Kit |
| `specs/NNN-*/` | Uma feature por pasta: `spec.md`, `plan.md`, `data-model.md`, `research.md`, `quickstart.md`, `tasks.md` |
| `.claude/skills/speckit-*/` | Os comandos do ciclo SDD |

**Leia a constituição antes de escrever qualquer código.** Três princípios são
não-negociáveis: ledger de sessões append-only, idempotência de webhook, e a
plataforma nunca custodiar o dinheiro da venda.

## Ciclo de trabalho

```
/speckit-specify  →  /speckit-clarify  →  /speckit-plan
                  →  /speckit-tasks    →  /speckit-analyze  →  /speckit-implement
```

Uma feature por vez. Commit e push na `main` ao fim de cada etapa.

## Roadmap

| Feature | Escopo | Estado |
|---|---|---|
| `001-fundacao-painel` | Schema, auth magic link, serviços, disponibilidade, bloqueios, pacotes | spec e plano prontos |
| `002-pagamento-pacotes` | `PaymentProvider`, Asaas, Pix, webhook, ledger de sessões | não iniciada |
| `003-bot-whatsapp` | Cloud API, Flows, comprar/agendar/saldo/cancelar | não iniciada |
| `004-lembretes-expiracao` | Cron, lembretes 24h/2h, expiração | não iniciada |
| `005-dashboard` | Receita, sessões vendidas vs usadas, clientes ativos | não iniciada |

## Stack

Next.js (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Auth.js v5 ·
Tailwind · Vitest · Vercel

## Ambiente de desenvolvimento

O desenvolvimento é feito por celular, em sessão remota sem servidor de longa duração.
Nenhuma tarefa pode depender de `npm run dev` ativo. Verificação sai de
`npm run build`, `vitest` e **deploy de preview da Vercel**.

Detalhes de setup: [`specs/001-fundacao-painel/quickstart.md`](specs/001-fundacao-painel/quickstart.md)
