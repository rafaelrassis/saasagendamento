# Quickstart — 001 Fundação e Painel

Ambiente: sessão remota efêmera, operada por celular. Não há servidor local de longa
duração — nada aqui depende de `npm run dev`.

## Pré-requisitos (contas)

| Serviço | O que obter |
|---|---|
| Neon | projeto Postgres → `DATABASE_URL` e `DIRECT_URL` |
| Resend | API key → `RESEND_API_KEY`, e um remetente verificado |
| Vercel | projeto ligado ao repo, com as env vars acima |

## Variáveis de ambiente

```
DATABASE_URL=
DIRECT_URL=
APP_URL=
AUTH_SECRET=
AUTH_URL=
RESEND_API_KEY=
EMAIL_FROM=
CRON_SECRET=
```

`AUTH_SECRET`: `openssl rand -base64 32`.

As variáveis de pagamento e WhatsApp pertencem às features 002 e 003 e não entram agora.

## Setup

```bash
npm install
npx prisma migrate dev --name inicial
npx prisma db seed
```

### Atenção: na sessão remota o Prisma CLI não roda

`binaries.prisma.sh` está fora da lista de hosts permitidos do ambiente remoto, então
`prisma generate`, `prisma migrate` e `prisma validate` falham lá. O schema e o SQL da
migration são escritos à mão; `generate` e `migrate deploy` acontecem no build da
Vercel, onde a rede é aberta. Para aplicar SQL fora de um deploy, usar o editor SQL do
console da Neon — funciona pelo celular.

O seed cria um profissional de desenvolvimento, três serviços, disponibilidade de
segunda a sábado e um pacote de quatro sessões.

## Verificação de cada fase

```bash
npm run build            # precisa passar
npx vitest run           # precisa passar
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
                        --to-schema-datamodel prisma/schema.prisma   # sem diferença
```

Depois, abrir o deploy de preview da Vercel no celular e conferir a tela da fase.

## Conferir as restrições de banco

As duas garantias dos princípios I e III não aparecem no schema Prisma. São verificadas
pelo teste de integração `tests/integration/db-constraints.test.ts` (tarefa T019), que
consulta `pg_constraint` e `pg_trigger` e tenta um UPDATE no extrato esperando falha.

```sql
-- as mesmas consultas, para rodar no editor SQL da Neon pelo celular
SELECT conname FROM pg_constraint WHERE conname = 'appointment_no_overlap';
SELECT tgname  FROM pg_trigger    WHERE tgname  = 'session_ledger_no_mutation';
```

Ambas devem retornar uma linha. Se não retornarem, a migration inicial está incompleta
e a feature não está pronta, independentemente do que a interface mostre.

## Encerrando a sessão de trabalho

```bash
git add -A && git commit -m "..." && git push origin main
```

Obrigatório ao fim de cada fase. O ambiente não persiste: o que não foi enviado
desaparece.
