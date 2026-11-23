# Feature Specification: Pagamento de Pacotes e Carteira de Sessões

**Feature Branch**: `002-pagamento-pacotes`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Camada PaymentProvider, integração Asaas, checkout Pix, webhook idempotente e ledger de sessões"

## Contexto

A feature 001 deu ao profissional o que vender. Esta dá o meio de receber: o cliente
paga por Pix e passa a ter sessões numa carteira.

É a feature com maior risco do sistema, porque lida com dinheiro de terceiro e com
saldo que o cliente vai cobrar. Os princípios I, II, V e VI da constituição existem
por causa dela.

**Não há interface de cliente nesta feature.** O WhatsApp é a 003. Aqui a compra é
disparada por um link que o profissional envia ou por chamada interna, e a verificação
é feita no painel e por teste automatizado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profissional habilita recebimento (Priority: P1)

O profissional conecta sua conta de recebimento. Até conectar, seus pacotes não podem
ser vendidos. Ele vê no painel se está apto a receber.

**Why this priority**: sem conta de recebimento do profissional, nenhum pagamento pode
acontecer sem violar o princípio V. É o portão de tudo.

**Independent Test**: um profissional sem conta conectada tenta gerar cobrança e é
impedido com motivo claro; depois de conectar, consegue.

**Acceptance Scenarios**:

1. **Given** profissional sem conta de recebimento, **When** acessa a área de recebimento, **Then** vê instrução para conectar e nenhum pacote aparece como vendável
2. **Given** profissional conectando, **When** o provedor confirma a conta, **Then** o identificador da conta é gravado e o profissional passa a constar apto
3. **Given** profissional apto, **When** o provedor informa pendência de verificação na conta dele, **Then** o painel reflete a pendência e a venda é suspensa
4. **Given** profissional sem conta apta, **When** o sistema tenta gerar qualquer cobrança para ele, **Then** a operação é recusada antes de qualquer chamada ao provedor

---

### User Story 2 - Cliente compra pacote avulso por Pix (Priority: P2)

Um cliente identificado por telefone compra um pacote de sessões. Recebe um Pix, paga,
e as sessões aparecem na carteira dele com prazo de validade.

**Why this priority**: é a transação central do produto. Avulso vem antes de assinatura
por ser mais simples e por não depender de recorrência.

**Independent Test**: gerar cobrança de um pacote de 4 sessões, simular a confirmação
do provedor, e verificar que a carteira passa a ter exatamente 4 sessões com validade
correta — e que simular a mesma confirmação de novo não altera nada.

**Acceptance Scenarios**:

1. **Given** pacote ativo e profissional apto, **When** uma compra é iniciada para um telefone, **Then** um registro de compra é criado como pendente e um meio de pagamento Pix é retornado
2. **Given** compra pendente, **When** o provedor confirma o pagamento, **Then** sessões iguais à composição do pacote são creditadas na carteira do cliente com validade calculada
3. **Given** confirmação já processada, **When** o provedor reenvia o mesmo evento, **Then** nenhuma sessão adicional é creditada
4. **Given** compra pendente, **When** o pagamento não é confirmado dentro do prazo do Pix, **Then** a compra fica expirada e nenhuma sessão é creditada
5. **Given** compra confirmada, **When** o pagamento é posteriormente estornado, **Then** uma entrada de debito compensatório remove as sessões correspondentes
6. **Given** um telefone nunca visto, **When** uma compra é iniciada para ele, **Then** o cliente é criado com o telefone como identidade

---

### User Story 3 - Cliente assina pacote mensal recorrente (Priority: P3)

O cliente assina um pacote mensal. A cada ciclo pago, novas sessões entram na carteira
e as do ciclo anterior expiram.

**Why this priority**: é o modelo de receita mais forte do produto, mas depende de toda
a mecânica da compra avulsa já funcionar.

**Independent Test**: criar assinatura, simular a primeira cobrança paga, simular a
renovação do mês seguinte, e verificar que o saldo foi reposto e não acumulado.

**Acceptance Scenarios**:

1. **Given** pacote do tipo assinatura e profissional apto, **When** uma assinatura é iniciada, **Then** a compra é criada com identificador de assinatura do provedor e ciclo definido
2. **Given** assinatura ativa, **When** o provedor confirma a cobrança de um novo ciclo, **Then** sessões do novo ciclo são creditadas e o ciclo é atualizado
3. **Given** assinatura ativa com sessões não usadas do ciclo anterior, **When** o novo ciclo é creditado, **Then** as sessões do ciclo anterior estão expiradas e não somam ao saldo
4. **Given** assinatura ativa, **When** a cobrança do ciclo falha, **Then** a compra passa a inadimplente e nenhuma sessão nova é creditada
5. **Given** assinatura inadimplente, **When** o pagamento é regularizado, **Then** as sessões do ciclo são creditadas uma única vez
6. **Given** assinatura ativa, **When** o cliente ou o profissional cancela, **Then** nenhum ciclo novo é cobrado e as sessões já creditadas permanecem até expirar

---

### User Story 4 - Carteira e extrato auditável (Priority: P4)

O profissional consulta, para cada cliente, quantas sessões restam, de qual pacote, até
quando valem, e o histórico de como aquele saldo foi formado.

**Why this priority**: é o que resolve disputa com o cliente. Depende de haver
movimento na carteira.

**Independent Test**: após uma compra, uma renovação e um estorno, o extrato mostra as
três entradas com motivo e o saldo corresponde à soma delas.

**Acceptance Scenarios**:

1. **Given** cliente com compras, **When** o profissional consulta a carteira dele, **Then** vê saldo por pacote, validade e próxima expiração
2. **Given** cliente com movimento, **When** o profissional abre o extrato, **Then** vê cada entrada com data, motivo e quantidade, em ordem cronológica
3. **Given** uma correção necessária, **When** o profissional registra um ajuste, **Then** uma nova entrada de ajuste é criada e nenhuma entrada anterior é alterada
4. **Given** qualquer entrada do extrato, **When** se tenta alterá-la ou removê-la diretamente no banco, **Then** a operação falha

---

### Edge Cases

- Provedor envia confirmação de pagamento de uma compra que não existe no sistema: o evento é persistido, marcado como não processável, e não derruba o recebimento dos demais.
- Provedor envia eventos fora de ordem (renovação antes da confirmação inicial): o sistema processa pelo identificador do evento e não assume ordem de chegada.
- Dois eventos distintos do provedor descrevem o mesmo pagamento: a chave de idempotência derivada do pagamento, não do evento, impede crédito duplo.
- Pacote é editado ou desativado depois de vendido: a compra mantém a composição vigente no momento da venda.
- Serviço que compõe o pacote é desativado com sessões já vendidas: as sessões continuam válidas e agendáveis.
- Cliente compra dois pacotes do mesmo profissional: saldos são independentes por compra, com validades próprias.
- Cliente compra de dois profissionais diferentes: carteiras totalmente separadas.
- Pagamento confirmado com valor diferente do cobrado: a compra é marcada para conferência manual e não credita automaticamente.
- Profissional perde a aptidão de recebimento com assinaturas ativas: as renovações seguem no provedor, e o painel sinaliza o risco.

## Requirements *(mandatory)*

### Functional Requirements

**Interface de provedor**

- **FR-001**: Toda operação de pagamento MUST passar pela interface `PaymentProvider`, com as operações de garantir conta, garantir cliente, criar cobrança única, criar assinatura, cancelar assinatura e interpretar webhook.
- **FR-002**: Nenhum módulo fora da camada de pagamento MUST importar SDK de provedor nem fazer chamada HTTP a provedor.
- **FR-003**: O sistema MUST normalizar os eventos do provedor para um conjunto fechado: pagamento confirmado, ciclo renovado, cobrança inadimplente, assinatura cancelada e pagamento estornado.
- **FR-004**: A primeira implementação MUST ser Asaas, com Pix para cobrança única e Pix Automático para recorrência.

**Recebimento do profissional**

- **FR-005**: O sistema MUST registrar o identificador da conta de recebimento do profissional e MUST NOT permitir geração de cobrança sem ele.
- **FR-006**: O valor pago MUST ser destinado à conta do profissional. O sistema MUST NOT realizar nenhum fluxo em que o valor transite pela conta da plataforma.
- **FR-007**: O sistema MUST manter a taxa de plataforma em zero nesta feature, com o mecanismo de split preparado mas inativo.

**Compra e crédito**

- **FR-008**: O sistema MUST criar registro de compra antes de solicitar cobrança ao provedor, com situação pendente.
- **FR-009**: O sistema MUST identificar o cliente pelo telefone, criando-o quando ainda não existir.
- **FR-010**: Sessões MUST ser creditadas somente após confirmação do provedor recebida por webhook.
- **FR-011**: O crédito MUST refletir a composição do pacote no momento da venda, e MUST NOT ser afetado por edição posterior do pacote.
- **FR-012**: A validade de cada sessão creditada MUST ser calculada a partir da validade do pacote vigente na venda.
- **FR-013**: Em assinatura, o crédito de um novo ciclo MUST expirar as sessões não usadas do ciclo anterior.
- **FR-014**: Estorno MUST gerar entrada compensatória, e MUST NOT alterar nem remover a entrada original.
- **FR-015**: Pagamento confirmado com valor divergente do cobrado MUST NOT creditar automaticamente e MUST ser sinalizado para conferência.

**Idempotência e integridade**

- **FR-016**: Todo evento recebido do provedor MUST ser persistido antes de qualquer processamento, com unicidade por provedor e identificador externo.
- **FR-017**: Toda entrada de carteira MUST carregar chave de idempotência determinística derivada do pagamento no provedor, não da entrega do evento.
- **FR-018**: Reprocessar um evento já processado MUST NOT produzir efeito adicional.
- **FR-019**: Evento referente a compra inexistente MUST ser persistido e marcado como não processável, sem interromper o processamento dos demais.
- **FR-020**: O sistema MUST NOT assumir ordem de chegada dos eventos.
- **FR-021**: A requisição de webhook MUST ter sua autenticidade verificada antes do processamento.
- **FR-022**: Saldo MUST ser sempre calculado por agregação do extrato; MUST NOT existir campo de saldo.
- **FR-023**: Entradas de extrato MUST ser imutáveis, garantido pelo próprio banco de dados.

**Consulta**

- **FR-024**: O profissional MUST poder consultar saldo, validade e extrato da carteira de cada cliente seu.
- **FR-025**: O profissional MUST poder registrar ajuste manual de sessões, que MUST gerar entrada identificada como ajuste.
- **FR-026**: Nenhum profissional MUST acessar carteira, compra ou extrato de cliente de outro profissional.

**Reconciliação**

- **FR-027**: O sistema MUST oferecer uma verificação diária que compare as compras ativas com o estado no provedor e reporte divergência, sem corrigir automaticamente.

### Key Entities

- **Purchase**: uma compra de pacote por um cliente. Guarda provedor, identificadores externos, situação, ciclo atual e a composição vendida.
- **SessionLedger**: o extrato imutável da carteira. Cada entrada tem quantidade com sinal, motivo, validade, chave de idempotência e vínculo com a compra.
- **WebhookEvent**: todo evento recebido de provedor, único por provedor e identificador externo.
- **Customer**: criado na primeira compra, identificado por telefone.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reenviar todos os eventos de um mês inteiro produz exatamente o mesmo saldo final para todos os clientes, verificado por teste automatizado.
- **SC-002**: Nenhum teste consegue produzir crédito de sessão sem um evento de confirmação de provedor correspondente.
- **SC-003**: Tentativa de alterar ou remover entrada de extrato falha em 100% dos casos, inclusive por acesso direto ao banco.
- **SC-004**: Soma do extrato corresponde ao saldo exibido em 100% dos casos testados, incluindo compra, renovação, expiração, cancelamento e estorno.
- **SC-005**: Nenhum valor transita pela conta da plataforma em nenhum fluxo, verificado por revisão do código da camada de pagamento e pela ausência de conta própria configurada.
- **SC-006**: Trocar o provedor por uma implementação de teste da mesma interface não exige alteração fora da camada de pagamento.
- **SC-007**: A verificação diária de reconciliação detecta 100% das divergências introduzidas artificialmente em teste.

## Assumptions

- O profissional tem CPF ou CNPJ e consegue abrir conta no provedor; a exigência documental é do provedor, não do sistema.
- A compra é disparada nesta feature por link ou chamada interna; a conversa que leva à compra é da feature 003.
- Cliente final não tem interface própria nesta feature.
- Pix é o único meio de pagamento desta feature. Cartão e boleto ficam fora.
- Não há emissão de nota fiscal nesta feature; é obrigação do profissional.
- Não há antecipação de recebíveis, split de comissão ativo nem repasse entre contas.
- O prazo de expiração do Pix é o padrão do provedor.
