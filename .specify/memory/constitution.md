# SaaS Agendamento Constitution

## Core Principles

### I. Ledger Imutável de Sessões (NÃO-NEGOCIÁVEL)

O saldo de sessões de um cliente MUST ser sempre derivado de um ledger append-only
(`SessionLedger`). Nenhuma tabela MUST conter coluna mutável de saldo, crédito ou
contador de sessões restantes. Saldo é `SUM(delta)` das entradas não expiradas.
Toda entrada MUST registrar `reason`, `idempotencyKey` e `expiresAt`.
Correção de erro MUST ser uma nova entrada de compensação, nunca `UPDATE` ou `DELETE`
em entrada existente.

Rationale: o produto vende serviço antecipado. Divergência de saldo é dinheiro do
cliente e disputa com o profissional. Ledger é a única estrutura que permite auditar
"por que esse cliente tem 3 sessões" meses depois.

### II. Idempotência de Eventos Externos (NÃO-NEGOCIÁVEL)

Crédito de sessão MUST nascer exclusivamente de webhook confirmado do gateway de
pagamento. MUST NOT nascer de cron, de callback de front-end, ou de ação manual sem
registro de origem. Todo webhook recebido MUST ser persistido em `WebhookEvent`
(unique em `provider` + `externalId`) ANTES de ser processado. Todo efeito derivado
MUST carregar `idempotencyKey` determinística derivada do id do evento no provedor.

Rationale: gateways reenviam. Processar duas vezes credita sessões que não foram
pagas; falhar em processar nega sessões pagas. Idempotência por construção elimina
as duas falhas sem lógica de retry ad hoc.

### III. Atomicidade de Agendamento

Debitar o ledger e criar o `Appointment` MUST acontecer na mesma transação de banco.
Conflito de horário MUST ser impedido por constraint no PostgreSQL
(`EXCLUDE USING gist` sobre `tstzrange` por profissional), não por validação em
aplicação. Cancelamento dentro da janela permitida MUST gerar entrada de crédito de
devolução; fora da janela MUST NOT gerar.

Rationale: validação em aplicação perde a corrida entre dois clientes marcando o
mesmo horário pelo WhatsApp ao mesmo tempo. O banco é o único árbitro confiável.

### IV. Tempo em UTC

Datas e horas MUST ser persistidas em UTC. Conversão para o timezone do profissional
MUST ocorrer somente na borda — entrada do usuário e exibição. Hora local MUST NOT
ser persistida. Todo profissional MUST ter `timezone` próprio.

### V. A Plataforma Não Custodia Dinheiro (NÃO-NEGOCIÁVEL)

O valor pago pelo cliente MUST ir para a conta ou subconta do profissional. Nenhuma
feature MUST fazer o valor transitar pela conta da plataforma. Comissão futura MUST
ser implementada como taxa de split no provedor (`platformFeeBps`), nunca como
repasse manual.

Rationale: quem recebe o dinheiro de um serviço antecipado responde pelo serviço não
entregue, por chargeback e pela obrigação fiscal. A plataforma não executa o corte de
cabelo e não pode assumir essa responsabilidade.

### VI. Pagamento Atrás de Interface

Toda integração de pagamento MUST passar pela interface `PaymentProvider`. Nenhum
arquivo fora de `lib/payments/` MUST importar SDK de gateway ou fazer chamada HTTP a
gateway. Eventos de provedor MUST ser normalizados antes de alcançar o domínio.

### VII. Disciplina de Custo e Segurança no WhatsApp

Antes de enviar mensagem proativa, o sistema MUST consultar `Customer.lastInboundAt`:
dentro de 24h usa mensagem livre; fora de 24h usa template utility. Mensagem proativa
sem essa checagem é defeito. Textos de template MUST NOT usar linguagem promocional.
Todo webhook do WhatsApp MUST ter a assinatura `X-Hub-Signature-256` validada antes de
qualquer processamento.

Rationale: template reclassificado de utility para marketing multiplica o custo por
nove. Em produto de margem fina e ticket baixo, isso é a diferença entre viável e
inviável.

### VIII. Isolamento Multi-Tenant

O tenant é `professionalId`. Toda query de dado de profissional MUST filtrar por ele.
Nenhum endpoint, Server Action ou query MUST retornar dado de um profissional para
outro. `organizationId` existe no schema como nullable e MUST NOT ter comportamento
até a feature de salão ser especificada.

### IX. Neutralidade de Vertical

O schema MUST usar nomes neutros (`Professional`, `Service`, `Package`). Termos de
nicho como "barbeiro", "corte" ou "barbearia" MUST NOT aparecer em tabela, coluna,
tipo, enum ou rota. Terminologia de nicho vive na camada de apresentação, resolvida
pelo campo `vertical`.

Rationale: o mesmo núcleo serve manicure e estética. Vazar vocabulário de barbearia
no schema cria migração desnecessária na primeira vertical nova.

### X. Simplicidade e Contenção de Escopo

Itens listados como fora do MVP na especificação de produto MUST NOT ser
implementados, nem parcialmente como campo de schema não usado, sem decisão explícita
registrada na spec da feature. Serviço de infraestrutura novo (fila, cache,
worker externo) MUST ter justificativa escrita na spec. Se a feature pode ser entregue
sem tabela nova, MUST ser entregue sem.

## Restrições Técnicas

Stack fixa: Next.js (App Router), TypeScript, Prisma, PostgreSQL, npm. Deploy na
Vercel. Mutação por Server Actions — camada REST interna MUST NOT ser criada.
Agendamento de tarefas por Vercel Cron sobre a tabela `ScheduledMessage`, com lock
otimista. Fila externa, Redis e worker dedicado estão fora até que uma spec justifique.

Credenciais da Meta MUST usar token de System User, nunca token de usuário — token de
usuário expira em 60 dias e derruba o bot sem aviso.

Layout MUST ser mobile-first: tanto o profissional quanto o desenvolvedor usam celular.

## Fluxo de Desenvolvimento

O desenvolvimento segue Spec-Driven Development com Spec Kit. Toda feature MUST passar
por `/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks` e
`/speckit-analyze` antes de `/speckit-implement`. Uma feature por pasta `specs/NNN-*`.

O desenvolvimento ocorre por celular, em sessão remota sem servidor de longa duração.
Nenhuma tarefa MUST depender de `npm run dev` ativo nem de inspeção manual em
localhost. Verificação MUST sair de `npm run build`, de testes automatizados
(`vitest`) e de deploy de preview na Vercel.

Toda etapa do ciclo MUST terminar com commit e push na `main`. Trabalho não commitado
é trabalho perdido, porque o ambiente de execução não persiste entre sessões.

A especificação de produto (decisões de negócio, modelo, riscos, itens fora do MVP) é
documento separado e MUST NOT ser sobrescrita pelos artefatos do Spec Kit. Em conflito
entre spec de feature e spec de produto, a divergência MUST ser resolvida
explicitamente antes de implementar.

## Governance

Esta constituição supersede qualquer outra prática do projeto. Em conflito entre esta
constituição e uma spec, plan ou task, a constituição vence e a spec MUST ser corrigida.

Emenda requer: justificativa escrita, atualização deste documento, incremento de versão
semântica e verificação de que specs existentes continuam conformes.

Versionamento: MAJOR para remoção ou redefinição incompatível de princípio; MINOR para
princípio ou seção nova; PATCH para esclarecimento sem mudança semântica.

Conformidade: `/speckit-analyze` MUST ser executado antes de `/speckit-implement` em
toda feature, e MUST reportar violação de qualquer princípio. Princípios marcados
NÃO-NEGOCIÁVEL MUST NOT ser flexibilizados por conveniência de prazo.

**Version**: 1.0.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23
