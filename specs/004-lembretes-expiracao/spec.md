# Feature Specification: Lembretes, Expiração e Renovação

**Feature Branch**: `004-lembretes-expiracao`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Lembretes 24h e 2h, expiração de sessões e renovação, por cron com otimização de janela de 24h"

## Contexto

Até aqui o sistema só fala quando o cliente fala. Esta feature dá voz ativa ao sistema:
lembra do horário, avisa que a sessão vai expirar, comunica renovação e falha de
cobrança.

É a feature de maior retorno por linha de código, e a de maior risco de custo. Cada
mensagem proativa tem preço, e a diferença entre a implementação cuidadosa e a
descuidada é cerca de quatro vezes na fatura mensal. O princípio VII existe por causa
disto.

É também o antídoto da decisão de expirar sessões no fim do ciclo: o aviso antes de
expirar transforma o que seria reclamação em agendamento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente é lembrado do horário (Priority: P1)

O cliente recebe um lembrete na véspera e outro poucas horas antes do atendimento,
com a opção de remarcar ali mesmo.

**Why this priority**: falta sem aviso é o prejuízo direto do profissional e a razão
mais citada para adotar o sistema. É o retorno mais visível da feature.

**Independent Test**: criar agendamento para dentro de 30 horas, avançar o tempo em
teste, e verificar que exatamente dois lembretes foram enfileirados e enviados, nos
momentos corretos.

**Acceptance Scenarios**:

1. **Given** agendamento criado para dentro de mais de 24 horas, **When** é confirmado, **Then** dois envios são agendados: um para 24 horas antes e outro para 2 horas antes
2. **Given** agendamento criado para dentro de menos de 24 horas, **When** é confirmado, **Then** apenas o envio de 2 horas antes é agendado
3. **Given** agendamento criado para dentro de menos de 2 horas, **When** é confirmado, **Then** nenhum lembrete é agendado
4. **Given** lembrete agendado, **When** o agendamento é cancelado ou remarcado antes do envio, **Then** o envio é descartado e, na remarcação, novos envios são agendados para o novo horário
5. **Given** o momento do envio chegou, **When** o processamento roda, **Then** a mensagem é enviada uma única vez, ainda que o processamento rode várias vezes
6. **Given** o envio falha por erro do canal, **When** o processamento roda de novo, **Then** há nova tentativa até um limite, e depois o envio é marcado como falho sem travar os demais
7. **Given** o cliente recebe o lembrete, **When** responde pedindo remarcar, **Then** cai no fluxo de remarcação da conversa

---

### User Story 2 - Sessão a expirar vira agendamento (Priority: P2)

Alguns dias antes de perder sessões, o cliente é avisado e convidado a agendar.

**Why this priority**: é a mitigação direta da regra de expiração. Sem ela, a regra que
protege a agenda do profissional vira motivo de cancelamento da assinatura.

**Independent Test**: criar saldo com validade próxima, avançar o tempo, e verificar
que o aviso foi enviado uma única vez por ciclo de validade, e que o saldo expirou na
data correta depois.

**Acceptance Scenarios**:

1. **Given** cliente com sessões a expirar em poucos dias, **When** o processamento roda, **Then** recebe um aviso com a quantidade e a data
2. **Given** aviso já enviado para um mesmo saldo e validade, **When** o processamento roda de novo, **Then** nenhum aviso adicional é enviado
3. **Given** cliente que agenda todas as sessões após o aviso, **When** a data de validade chega, **Then** nenhuma expiração ocorre e nenhum aviso adicional é enviado
4. **Given** sessões cuja validade passou, **When** o processamento roda, **Then** as sessões deixam de compor o saldo por efeito da validade, sem alteração de nenhuma entrada anterior
5. **Given** cliente sem nenhuma sessão a expirar, **When** o processamento roda, **Then** nenhuma mensagem é enviada

---

### User Story 3 - Renovação e falha de cobrança comunicadas (Priority: P3)

O cliente com assinatura sabe quando o ciclo renovou e quantas sessões tem agora. Se a
cobrança falhar, sabe disso e recebe como resolver.

**Why this priority**: evita que o cliente descubra sozinho que ficou sem sessões.
Depende da mecânica de ciclo da feature 002.

**Independent Test**: simular renovação de ciclo e verificar o aviso com o novo saldo;
simular falha de cobrança e verificar o aviso com meio de regularização.

**Acceptance Scenarios**:

1. **Given** assinatura cujo ciclo renovou e foi pago, **When** o crédito é registrado, **Then** o cliente é avisado com a quantidade e a nova validade
2. **Given** assinatura com cobrança falha, **When** a inadimplência é registrada, **Then** o cliente é avisado com o meio de regularizar
3. **Given** assinatura cujo ciclo vai renovar em poucos dias, **When** o processamento roda, **Then** nenhum aviso antecipado é enviado, para não gerar cancelamento por lembrança de cobrança
4. **Given** assinatura cancelada, **When** o ciclo seguinte não é cobrado, **Then** nenhum aviso de renovação é enviado

---

### User Story 4 - Profissional vê o que foi comunicado (Priority: P4)

O profissional consulta quais mensagens foram enviadas a cada cliente e quais falharam.

**Why this priority**: necessário para resolver "não recebi aviso nenhum", mas não
bloqueia o funcionamento.

**Independent Test**: após um ciclo de envios, o profissional vê a lista com situação
de cada mensagem.

**Acceptance Scenarios**:

1. **Given** envios realizados, **When** o profissional consulta um cliente, **Then** vê as mensagens enviadas com data e situação
2. **Given** envios falhos, **When** o profissional consulta, **Then** os falhos aparecem destacados
3. **Given** cliente de outro profissional, **When** se tenta consultar, **Then** o acesso é negado

---

### Edge Cases

- Processamento não roda por várias horas e acumula envios atrasados: envios cuja utilidade passou são descartados, não enviados em lote — lembrete de 2 horas depois do atendimento é pior que nenhum.
- Duas execuções do processamento coincidem: cada envio é tomado por apenas uma, sem envio duplicado.
- Cliente agendou dois atendimentos no mesmo dia: recebe lembretes de ambos, sem agrupamento.
- Cliente cancelou o agendamento minutos antes do envio: o envio é descartado.
- Agendamento remarcado várias vezes: apenas os envios do horário vigente permanecem.
- Canal recusa a mensagem por template não aprovado: o envio é marcado como falho com o motivo, e o profissional é alertado — não há tentativa com texto livre.
- Cliente bloqueou o número da plataforma: a falha é registrada e não há nova tentativa indefinida.
- Cliente escreveu ao sistema minutos antes do lembrete: a mensagem segue pelo caminho mais barato, sem perda de conteúdo.
- Agendamento com horário em fuso diferente do profissional: os momentos de envio seguem o horário efetivo do atendimento.
- Expiração e lembrete caem no mesmo minuto: ambos são processados, sem interferência.

## Requirements *(mandatory)*

### Functional Requirements

**Agendamento de envios**

- **FR-001**: Todo envio proativo MUST ser registrado como envio agendado antes de ocorrer, com momento previsto e chave de idempotência.
- **FR-002**: Confirmação de agendamento MUST agendar lembrete para 24 horas e para 2 horas antes, omitindo os que já estariam no passado.
- **FR-003**: Cancelamento ou remarcação MUST descartar os envios pendentes do horário anterior, e a remarcação MUST agendar os do novo horário.
- **FR-004**: O processamento MUST ocorrer periodicamente, com intervalo que garanta precisão de poucos minutos.
- **FR-005**: O processamento MUST tomar cada envio de forma exclusiva, impedindo que execuções simultâneas enviem a mesma mensagem.
- **FR-006**: Envio cuja utilidade já passou MUST ser descartado em vez de enviado.
- **FR-007**: Falha de envio MUST gerar nova tentativa até um limite definido, após o qual MUST ser marcada como falha sem bloquear os demais envios.
- **FR-008**: Reexecução do processamento MUST NOT produzir envio duplicado.
- **FR-009**: O endpoint de processamento MUST exigir credencial e MUST recusar chamada não autenticada.

**Disciplina de custo**

- **FR-010**: Antes de cada envio proativo, o sistema MUST verificar o momento da última mensagem recebida do cliente: dentro de 24 horas MUST usar mensagem livre; a partir de 24 horas MUST usar template aprovado.
- **FR-011**: Envio proativo sem essa verificação MUST ser considerado defeito, não otimização pendente.
- **FR-012**: Os textos de template MUST NOT conter linguagem promocional, para não serem reclassificados em categoria de custo superior.
- **FR-013**: O sistema MUST registrar, por envio, qual caminho foi usado, permitindo apurar o custo real.

**Expiração**

- **FR-014**: O sistema MUST avisar o cliente com antecedência configurável quando houver sessões a expirar.
- **FR-015**: O aviso de expiração MUST ser enviado uma única vez por conjunto de saldo e validade.
- **FR-016**: Sessões vencidas MUST deixar de compor o saldo por efeito da data de validade, e o sistema MUST NOT alterar nem remover entrada alguma do extrato para isso.
- **FR-017**: O sistema MUST NOT avisar cliente sem sessões a expirar.

**Renovação**

- **FR-018**: Renovação de ciclo paga MUST notificar o cliente com quantidade e nova validade.
- **FR-019**: Cobrança inadimplente MUST notificar o cliente com o meio de regularizar.
- **FR-020**: O sistema MUST NOT enviar aviso antecipado de cobrança futura.
- **FR-021**: Assinatura cancelada MUST NOT gerar aviso de renovação.

**Consulta e isolamento**

- **FR-022**: O profissional MUST poder consultar os envios de cada cliente seu, com data e situação.
- **FR-023**: Envios falhos MUST ser destacados ao profissional.
- **FR-024**: Template recusado pelo canal MUST alertar o profissional, e o sistema MUST NOT tentar substituir por texto livre.
- **FR-025**: Nenhum profissional MUST acessar envios de cliente de outro profissional.

### Key Entities

- **ScheduledMessage**: um envio proativo previsto, com momento, situação, tentativas, chave de idempotência e marca de tomada exclusiva.
- **Customer**: o momento da última mensagem recebida dele é a base da regra de custo.
- **Appointment**: origem dos lembretes; seu cancelamento ou remarcação descarta envios.
- **SessionLedger**: a validade das entradas determina o aviso de expiração e o efeito da expiração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhum envio duplicado é produzido em nenhum cenário testado, inclusive execuções simultâneas e reexecução após falha parcial.
- **SC-002**: Em 100% dos envios, o caminho escolhido corresponde à regra de janela de 24 horas, verificado por teste automatizado e pelo registro de cada envio.
- **SC-003**: O custo mensal de mensagens proativas, apurado pelo registro de envios, fica em no máximo um quarto do que custaria enviando todos por template.
- **SC-004**: Nenhum lembrete é entregue depois do horário do atendimento a que se refere.
- **SC-005**: Expiração de sessão nunca altera nem remove entrada do extrato, verificado pelo bloqueio de mutação do banco.
- **SC-006**: Aviso de expiração é enviado no máximo uma vez por conjunto de saldo e validade, em 100% dos casos testados.
- **SC-007**: Falha persistente de envio a um cliente não impede o envio aos demais na mesma execução.

## Assumptions

- Os templates necessários estão aprovados pela Meta antes do início desta feature; sem aprovação, apenas a parte de mensagem livre funciona.
- O intervalo de execução do processamento é suportado pela plataforma de hospedagem.
- Volume inicial cabe em processamento por tabela, sem fila dedicada; fila entra só se o volume exigir, com justificativa em spec.
- Não há envio por SMS nem por e-mail nesta feature.
- Não há campanha, promoção ou mensagem de marketing — apenas comunicação transacional.
- O cliente pode responder ao lembrete, e a resposta cai nos fluxos da feature 003.
- A antecedência do aviso de expiração é parâmetro do sistema, não de cada profissional, nesta feature.
