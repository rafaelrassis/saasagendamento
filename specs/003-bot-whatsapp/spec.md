# Feature Specification: Bot WhatsApp do Cliente Final

**Feature Branch**: `003-bot-whatsapp`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Bot WhatsApp Cloud API com Flows para comprar pacote, agendar, consultar saldo e cancelar"

## Contexto

Esta é a feature que entrega o diferencial do produto: o cliente final nunca instala
nada nem cria senha. Ele conversa pelo WhatsApp e tudo acontece ali — comprar, agendar,
consultar, remarcar, cancelar.

O número de WhatsApp é único da plataforma. O bot identifica de qual profissional o
cliente está falando pelo texto de entrada do link, e se apresenta com o nome dele.

É aqui que o agendamento efetivo nasce: as features 001 e 002 criaram a agenda
configurada e a carteira de sessões, mas nada consome nenhuma das duas até agora.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente chega e é reconhecido (Priority: P1)

O cliente clica no link do profissional e cai numa conversa já contextualizada. O bot
se apresenta pelo nome do profissional e diz o que o cliente pode fazer. Se ele já tem
sessões, isso aparece de imediato.

**Why this priority**: sem resolver de qual profissional se trata e quem é o cliente,
nenhuma outra intenção pode ser atendida. É a base da conversa.

**Independent Test**: enviar mensagem a partir do link de um profissional e verificar
que o bot responde identificando aquele profissional e o estado do cliente.

**Acceptance Scenarios**:

1. **Given** um telefone nunca visto, **When** envia a mensagem do link de um profissional, **Then** o cliente é criado e o bot se apresenta com o nome daquele profissional
2. **Given** cliente já conhecido com sessões válidas, **When** envia qualquer mensagem, **Then** o bot informa o saldo e oferece agendar
3. **Given** cliente conhecido de dois profissionais, **When** chega pelo link de um deles, **Then** o contexto é daquele profissional, sem misturar saldos
4. **Given** cliente que escreve sem ter vindo de nenhum link, **When** envia mensagem, **Then** o bot pergunta de qual profissional se trata entre aqueles com quem ele já tem relação, ou orienta a usar o link
5. **Given** qualquer mensagem recebida do cliente, **When** é processada, **Then** o momento da última entrada do cliente é registrado
6. **Given** uma requisição de webhook sem autenticidade válida, **When** chega ao sistema, **Then** é recusada sem processamento

---

### User Story 2 - Cliente agenda consumindo sessão (Priority: P2)

O cliente escolhe o serviço e o horário num formulário dentro do próprio chat. Ao
confirmar, uma sessão sai da carteira e o horário fica reservado.

**Why this priority**: é o uso que dá valor ao que o cliente já pagou. Sem isso o
pacote vendido não se realiza.

**Independent Test**: com um cliente que tem 4 sessões, agendar uma e verificar que o
saldo caiu para 3, que o horário ficou ocupado, e que o mesmo horário não pode ser
tomado por outro cliente.

**Acceptance Scenarios**:

1. **Given** cliente com sessão válida, **When** pede para agendar, **Then** recebe um formulário com os serviços cobertos pelo saldo dele
2. **Given** serviço escolhido, **When** o formulário é apresentado, **Then** mostra apenas horários livres segundo a disponibilidade e os bloqueios do profissional, na duração daquele serviço
3. **Given** horário escolhido e saldo suficiente, **When** o cliente confirma, **Then** o agendamento é criado e exatamente uma sessão é debitada na mesma operação
4. **Given** dois clientes escolhendo o mesmo horário ao mesmo tempo, **When** ambos confirmam, **Then** apenas um agendamento existe e o outro recebe aviso de horário tomado com o saldo intacto
5. **Given** cliente sem saldo válido, **When** pede para agendar, **Then** o bot informa e oferece comprar
6. **Given** cliente com saldo expirado, **When** pede para agendar, **Then** o saldo expirado não é oferecido e o bot explica
7. **Given** falha ao criar o agendamento, **When** a operação é revertida, **Then** nenhuma sessão foi debitada

---

### User Story 3 - Cliente compra pacote na conversa (Priority: P3)

O cliente sem saldo, ou querendo renovar, escolhe um pacote no chat, recebe o Pix,
paga, e o bot confirma as sessões disponíveis.

**Why this priority**: é o funil de entrada do produto. Vem depois do agendamento
porque a mecânica de compra já existe na feature 002 — aqui só se liga a conversa a ela.

**Independent Test**: pedir para comprar, escolher um pacote, receber o meio de
pagamento, simular a confirmação, e verificar que o bot avisa o cliente e o saldo está
disponível para agendar.

**Acceptance Scenarios**:

1. **Given** cliente em conversa, **When** pede para comprar, **Then** recebe formulário com os pacotes ativos daquele profissional, com preço e composição
2. **Given** pacote escolhido, **When** o cliente confirma, **Then** recebe o meio de pagamento Pix
3. **Given** pagamento confirmado pelo provedor, **When** o crédito é registrado, **Then** o cliente recebe mensagem informando as sessões e a validade
4. **Given** pagamento não confirmado dentro do prazo, **When** o prazo expira, **Then** o cliente recebe aviso e pode tentar novamente
5. **Given** profissional sem conta de recebimento apta, **When** o cliente pede para comprar, **Then** o bot informa indisponibilidade sem expor detalhe técnico
6. **Given** cliente que acabou de comprar, **When** o crédito entra, **Then** o bot oferece agendar na mesma conversa

---

### User Story 4 - Cliente consulta, remarca e cancela (Priority: P4)

O cliente pergunta quanto tem, vê seus próximos horários, e remarca ou cancela quando
precisa — respeitando a janela mínima definida pelo profissional.

**Why this priority**: reduz trabalho do profissional e evita falta sem aviso, mas
pressupõe agendamento funcionando.

**Independent Test**: com um agendamento futuro, remarcar dentro da janela e verificar
que o saldo se mantém; cancelar fora da janela e verificar que a sessão é perdida.

**Acceptance Scenarios**:

1. **Given** cliente com saldo, **When** pergunta quanto tem, **Then** recebe sessões restantes, validade e próximo horário
2. **Given** agendamento futuro dentro da janela de cancelamento, **When** o cliente cancela, **Then** o horário é liberado e a sessão é devolvida
3. **Given** agendamento futuro fora da janela, **When** o cliente cancela, **Then** o horário é liberado e a sessão MUST NOT ser devolvida, com o motivo explicado antes da confirmação
4. **Given** agendamento futuro dentro da janela, **When** o cliente remarca, **Then** o novo horário é reservado e o saldo permanece igual
5. **Given** agendamento remarcado, **When** a operação falha no meio, **Then** o cliente permanece com o horário original e o saldo intacto
6. **Given** cliente com vários agendamentos, **When** pede para cancelar, **Then** escolhe qual entre os futuros
7. **Given** profissional cancela um horário pelo painel, **When** o cancelamento ocorre, **Then** a sessão é devolvida ao cliente e ele é avisado

---

### Edge Cases

- Cliente escreve texto livre que não corresponde a nenhuma intenção: o bot oferece as opções disponíveis em vez de insistir em interpretar.
- Cliente abandona um formulário no meio e escreve outra coisa: a conversa reinicia na nova intenção sem deixar operação pendente.
- Cliente envia áudio, imagem ou documento: o bot responde que trabalha por texto e formulário, e reapresenta as opções.
- Cliente responde a uma mensagem antiga do histórico: a conversa segue pelo estado atual, não pelo contexto da mensagem citada.
- Mesma mensagem é entregue duas vezes pelo WhatsApp: processada uma única vez.
- Cliente pede para agendar num horário que acabou de ser bloqueado pelo profissional: recusado com aviso e oferta de outro horário.
- Cliente tem saldo de dois pacotes diferentes com validades distintas: o consumo usa primeiro o que expira antes.
- Cliente tem saldo que cobre serviço A mas pede serviço B não incluído: o bot explica o que o saldo cobre.
- Cliente pede para agendar com antecedência maior que a disponibilidade configurada: limitado a um horizonte definido.
- Profissional não configurou disponibilidade alguma: o bot informa que o profissional não está com agenda aberta.
- Cliente bloqueia ou deixa de responder no meio de uma compra: a compra fica pendente e expira sem efeito colateral.

## Requirements *(mandatory)*

### Functional Requirements

**Canal e identificação**

- **FR-001**: O sistema MUST receber mensagens pela Cloud API oficial do WhatsApp, em número único da plataforma.
- **FR-002**: A autenticidade de toda requisição de webhook do WhatsApp MUST ser verificada antes de qualquer processamento.
- **FR-003**: Mensagem entregue em duplicidade MUST ser processada uma única vez.
- **FR-004**: O cliente MUST ser identificado pelo telefone, criado na primeira interação, sem login nem senha.
- **FR-005**: O sistema MUST determinar o profissional do contexto pelo texto de entrada do link e MUST perguntar quando não houver como determinar.
- **FR-006**: O bot MUST se apresentar com o nome do profissional, não com o nome da plataforma.
- **FR-007**: O momento da última mensagem recebida do cliente MUST ser registrado em toda interação, para a regra de janela da feature 004.
- **FR-008**: O estado da conversa MUST ser persistido por cliente, e MUST ser descartável sem perda de dado de negócio.

**Interação**

- **FR-009**: Seleção de serviço, de horário e de pacote MUST usar formulário nativo do WhatsApp; menu numérico MUST existir apenas como alternativa de contingência.
- **FR-010**: O bot MUST reconhecer as intenções de comprar, agendar, consultar saldo, remarcar e cancelar.
- **FR-011**: Texto não reconhecido MUST levar à apresentação das opções, não a nova tentativa de interpretação.
- **FR-012**: Mídia recebida MUST ser respondida com orientação e reapresentação das opções.
- **FR-013**: Nova intenção MUST encerrar o fluxo anterior sem deixar operação pendente.

**Agendamento**

- **FR-014**: Os horários oferecidos MUST derivar da disponibilidade e dos bloqueios do profissional, fatiados pela duração do serviço escolhido, no fuso do profissional.
- **FR-015**: A criação do agendamento e o debito da sessão MUST ocorrer na mesma transação.
- **FR-016**: Horário já ocupado MUST ser impedido pelo próprio banco de dados, e a recusa MUST deixar o saldo do cliente intacto.
- **FR-017**: O sistema MUST oferecer apenas serviços cobertos pelo saldo válido do cliente.
- **FR-018**: Sessão expirada MUST NOT ser oferecida nem consumida.
- **FR-019**: Havendo saldos de validades diferentes, o consumo MUST usar primeiro o de validade mais próxima.
- **FR-020**: O sistema MUST limitar o agendamento a um horizonte futuro definido.

**Cancelamento e remarcação**

- **FR-021**: Cancelamento dentro da janela mínima do profissional MUST liberar o horário e devolver a sessão.
- **FR-022**: Cancelamento fora da janela MUST liberar o horário e MUST NOT devolver a sessão, com a consequência explicada antes da confirmação.
- **FR-023**: Remarcação MUST preservar o saldo e MUST ser atômica: ou o novo horário é reservado, ou o original permanece.
- **FR-024**: Cancelamento feito pelo profissional MUST devolver a sessão ao cliente e MUST notificá-lo.

**Compra**

- **FR-025**: O bot MUST oferecer os pacotes ativos do profissional e MUST entregar o meio de pagamento gerado pela camada de pagamento.
- **FR-026**: O bot MUST notificar o cliente quando o crédito for confirmado, e MUST oferecer agendar em seguida.
- **FR-027**: Profissional sem conta de recebimento apta MUST levar a mensagem de indisponibilidade sem exposição de detalhe técnico.

**Isolamento**

- **FR-028**: O bot MUST NOT revelar a um cliente dado de outro cliente, nem dado de profissional diferente daquele em contexto.
- **FR-029**: Saldos de um mesmo cliente com profissionais diferentes MUST permanecer separados.

### Key Entities

- **WaConversation**: o estado da conversa de um cliente, com o profissional em contexto e o passo do fluxo. Descartável.
- **Appointment**: o agendamento efetivo, criado nesta feature pela primeira vez.
- **Customer**: ganha nome e registro de última entrada nesta feature.
- **SessionLedger**: recebe as entradas de debito por agendamento e de crédito por cancelamento dentro da janela.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente que nunca usou o sistema compra um pacote e agenda sem nenhuma instrução externa, apenas pela conversa.
- **SC-002**: Nenhum teste de concorrência consegue produzir dois agendamentos sobrepostos para o mesmo profissional.
- **SC-003**: Nenhum teste consegue produzir agendamento sem debito de sessão, nem debito sem agendamento.
- **SC-004**: Reentrega de qualquer mensagem do WhatsApp não produz efeito duplicado em 100% dos casos testados.
- **SC-005**: Perder completamente o estado da conversa não causa perda de dado de negócio: saldo, agendamento e compra permanecem íntegros.
- **SC-006**: Nenhuma resposta do bot expõe identificador interno, mensagem de erro técnica ou dado de terceiro.
- **SC-007**: O cliente completa um agendamento em no máximo quatro interações a partir da intenção.

## Assumptions

- A verificação do negócio na Meta e a aprovação dos templates estão concluídas antes do início desta feature.
- O número usado na Cloud API é exclusivo da plataforma e não tem WhatsApp comum ativo.
- As credenciais usam token de usuário de sistema, que não expira em 60 dias.
- Os lembretes proativos e a expiração são da feature 004; aqui há apenas mensagens em resposta ao cliente e a notificação de crédito confirmado.
- O cliente usa WhatsApp em versão que suporta formulário nativo; o menu numérico cobre os demais.
- Não há atendimento humano assumindo a conversa nesta feature.
- Não há suporte a áudio, imagem ou pagamento dentro do WhatsApp além do meio Pix entregue como link ou código.
