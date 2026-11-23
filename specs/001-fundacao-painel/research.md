# Research — 001 Fundação e Painel

## Magic link: Auth.js v5 vs implementação própria

**Escolhido: Auth.js v5 (`next-auth`) com provider de e-mail e adapter Prisma.**

Magic link exige token de uso único, expiração, invalidação do token anterior, proteção
contra enumeração de e-mail e cookie de sessão assinado. Tudo isso já existe no Auth.js,
auditado e com adapter Prisma oficial.

Rejeitado implementar à mão: adicionaria superfície de segurança sem ganho funcional.
O custo é uma dependência e o modelo de tabelas do adapter no schema.

## Envio de e-mail: Resend vs SMTP genérico

**Escolhido: Resend.**

Free tier suficiente para desenvolvimento e primeiros profissionais; integração é uma
chamada HTTP; verificação de domínio pode ser feita depois do primeiro deploy.

Rejeitado SMTP genérico (Gmail, provedor de hospedagem): exige lidar com reputação de IP,
e magic link que cai na pasta de spam é o mesmo que acesso quebrado — o pior modo de
falha possível num fluxo sem senha.

## Banco: Neon vs Supabase

**Escolhido: Neon.**

O fator decisivo é branch de banco por deploy de preview. Como o desenvolvimento ocorre
em sessão remota efêmera operada por celular, sem `npm run dev`, toda verificação visual
acontece no preview da Vercel. Com Neon cada preview recebe um banco isolado sem trabalho
manual; sem isso, previews compartilhariam o banco de desenvolvimento e sujariam dados
entre si.

Supabase foi rejeitado apenas nesse critério — Auth, Storage e Realtime que ele oferece
não são usados aqui, então não compensam a falta do branching.

## Componentes de UI: biblioteca vs próprios

**Escolhido: Tailwind com cerca de seis componentes próprios.**

A feature precisa de botão, campo, seleção, cartão, painel deslizante e diálogo. Uma
biblioteca de componentes traria dezenas de arquivos gerados para o repositório, que
precisariam ser lidos e revisados numa tela de celular. Isso conflita com o princípio X
sem resolver um problema real neste escopo.

Reavaliar na feature 005 (dashboard), onde componentes de gráfico justificam dependência.

## Hora recorrente: texto `HH:MM` vs timestamp

**Escolhido: texto `HH:MM` em `Availability`.**

Disponibilidade semanal é regra em hora local, não instante no tempo. Persistir como
`timestamptz` exigiria ancorar numa data fictícia, e a regra se deslocaria se o
profissional trocasse de fuso — exatamente o cenário do edge case previsto na spec.

Instantes reais — `TimeBlock`, `Appointment`, tudo em `SessionLedger` — permanecem
`timestamptz` em UTC conforme o princípio IV.

## Append-only: convenção vs trigger de banco

**Escolhido: trigger que bloqueia UPDATE e DELETE em `SessionLedger`.**

O princípio I é não-negociável, e convenção de código não sobrevive a um script de
correção rodado às pressas em produção. Três linhas de PL/pgSQL transformam a convenção
em garantia.

Custo: correção de erro exige entrada de compensação, o que é precisamente o
comportamento desejado.

## Unicidade de slug: verificação prévia vs constraint

**Escolhido: unique index como árbitro, com tradução do erro de violação.**

`SELECT` de verificação seguido de `INSERT` tem janela de corrida. Com baixo volume a
corrida é improvável, mas a correção custa zero: tentar inserir e tratar o erro.

Lista de slugs reservados (`api`, `entrar`, `verificar`, `painel`, `admin`, `app`,
`sobre`, `ajuda`, `termos`, `privacidade`, `_next`, `static`) fica em `lib/slug.ts`.
