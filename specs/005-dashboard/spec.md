# Feature Specification: Dashboard do Profissional

**Feature Branch**: `005-dashboard`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Dashboard do profissional com receita do mês, sessões vendidas versus usadas e clientes ativos"

## Contexto

O produto promete previsibilidade de receita. Esta feature é onde essa promessa fica
visível: o profissional abre o painel e vê quanto entrou, quanto ainda deve atender, e
quantos clientes estão ativos.

Deliberadamente pequena. Três números e um passivo. A tentação de construir relatório
é o principal risco aqui, e o princípio X se aplica com força: o profissional de
barbearia não quer relatório, quer saber se o mês está bom.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Três números do mês (Priority: P1)

O profissional abre o painel e vê, do mês corrente: quanto recebeu, quantas sessões
vendeu contra quantas foram usadas, e quantos clientes estão ativos.

**Why this priority**: é a feature inteira. Se só isso existir, a promessa do produto
está cumprida.

**Independent Test**: com dados de seed cobrindo compras, agendamentos atendidos e
sessões pendentes, os três números conferem com a soma manual.

**Acceptance Scenarios**:

1. **Given** profissional com compras confirmadas no mês, **When** abre o painel, **Then** vê a receita do mês somando apenas pagamentos confirmados
2. **Given** compras no mês, **When** abre o painel, **Then** vê quantas sessões foram vendidas e quantas já foram usadas no período
3. **Given** clientes com saldo válido ou atendimento recente, **When** abre o painel, **Then** vê a contagem de clientes ativos
4. **Given** profissional sem nenhum movimento, **When** abre o painel, **Then** vê os três números em zero com orientação do que fazer, não tela vazia
5. **Given** pagamento estornado no mês, **When** abre o painel, **Then** a receita já desconta o estorno
6. **Given** dados de outro profissional no sistema, **When** abre o painel, **Then** nenhum número inclui movimento alheio

---

### User Story 2 - Passivo de sessões em aberto (Priority: P2)

O profissional vê quantas sessões já pagas ele ainda deve atender, e quanto disso
expira em breve.

**Why this priority**: é o número que ninguém mostra e que define a saúde real do
negócio em venda antecipada — receita recebida é serviço devido. Também é a mitigação
do risco de ele vender além da capacidade de atender.

**Independent Test**: com saldo vendido e parcialmente consumido, o passivo corresponde
à soma das sessões válidas não usadas, e o recorte de expiração próxima confere.

**Acceptance Scenarios**:

1. **Given** sessões vendidas e não usadas, **When** abre o painel, **Then** vê o total de sessões que ainda deve atender
2. **Given** parte do passivo com validade próxima, **When** abre o painel, **Then** vê quanto expira nos próximos dias
3. **Given** passivo alto em relação à sua disponibilidade configurada, **When** abre o painel, **Then** vê um alerta de que pode não ter horário suficiente
4. **Given** sessões já expiradas, **When** abre o painel, **Then** não constam no passivo

---

### User Story 3 - Comparação com o mês anterior (Priority: P3)

Cada número vem com a variação em relação ao mês anterior.

**Why this priority**: transforma número em informação. Receita de um valor qualquer só
significa algo comparada a antes. É incremento barato sobre a US1.

**Independent Test**: com dois meses de dados, cada variação confere com o cálculo
manual.

**Acceptance Scenarios**:

1. **Given** dois meses com movimento, **When** abre o painel, **Then** cada número mostra a variação percentual contra o mês anterior
2. **Given** primeiro mês de uso, **When** abre o painel, **Then** nenhuma variação é exibida, sem erro nem valor enganoso
3. **Given** mês anterior com valor zero, **When** há valor no mês atual, **Then** a variação é apresentada de forma compreensível, sem divisão por zero

---

### Edge Cases

- Profissional abre o painel no dia 1 do mês: números do mês corrente ainda próximos de zero, sem parecer erro.
- Compra confirmada num mês e sessões usadas no seguinte: receita conta no mês do pagamento, uso conta no mês do atendimento, e essa diferença é explicada na própria tela.
- Estorno de pagamento de mês anterior: desconta no mês do estorno, não refaz o mês passado.
- Assinatura renovada no mês: cada ciclo pago conta como receita daquele mês.
- Ajuste manual de sessões feito pelo profissional: afeta o passivo, não a receita.
- Cliente que comprou e nunca agendou: conta como ativo enquanto tiver saldo válido.
- Profissional com muitos clientes: a tela não degrada — nenhum número exige varredura completa do extrato sem recorte de período.
- Fuso do profissional diferente do servidor: mês e dia seguem o fuso dele.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel MUST exibir receita do mês corrente, considerando apenas pagamentos confirmados e descontando estornos ocorridos no período.
- **FR-002**: O painel MUST exibir sessões vendidas e sessões usadas no mês corrente.
- **FR-003**: O painel MUST exibir a contagem de clientes ativos, definidos como clientes com saldo válido ou atendimento no período.
- **FR-004**: O painel MUST exibir o passivo de sessões: total de sessões pagas, válidas e ainda não usadas.
- **FR-005**: O painel MUST exibir quanto do passivo expira nos próximos dias.
- **FR-006**: O painel MUST alertar quando o passivo for alto em relação à disponibilidade configurada do profissional.
- **FR-007**: Sessões expiradas MUST NOT compor o passivo.
- **FR-008**: Cada número MUST exibir a variação em relação ao mês anterior, omitindo a variação quando não houver base de comparação.
- **FR-009**: Todo cálculo MUST usar o fuso horário do profissional para delimitar mês e dia.
- **FR-010**: Todo número MUST ser restrito ao profissional autenticado.
- **FR-011**: Sem nenhum movimento, o painel MUST exibir zeros com orientação, e MUST NOT exibir tela vazia nem erro.
- **FR-012**: Receita MUST ser derivada das compras e do extrato; MUST NOT existir tabela de totais acumulados mantida por gravação.
- **FR-013**: Nenhum cálculo MUST varrer o extrato inteiro sem recorte de período.
- **FR-014**: A tela MUST ser legível em 360 pixels de largura.

### Key Entities

Nenhuma entidade nova. A feature lê `Purchase`, `SessionLedger`, `Appointment`,
`Customer` e `Availability`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Os cinco números conferem com o cálculo manual sobre dados de seed, em 100% dos casos testados, incluindo estorno, ajuste manual e assinatura renovada.
- **SC-002**: O painel carrega em menos de 1 segundo para um profissional com 12 meses de histórico e 500 clientes.
- **SC-003**: Nenhuma consulta do painel percorre o extrato sem filtro de período e de profissional, verificado por revisão das consultas.
- **SC-004**: Nenhum número inclui dado de outro profissional, verificado por teste automatizado.
- **SC-005**: Nenhuma tabela de totais acumulados é criada: todos os números são derivados em consulta.
- **SC-006**: O profissional entende o que cada número significa sem explicação externa, verificado com pelo menos três profissionais reais.

## Assumptions

- Não há exportação, relatório em arquivo nem envio por e-mail nesta feature.
- Não há gráfico de série temporal; apenas número e variação. Gráfico entra se um profissional pedir, com spec própria.
- Não há recorte por serviço, por pacote nem por cliente — apenas o total do profissional.
- Não há visão consolidada de salão; multi-profissional é feature posterior.
- Período fixo é o mês corrente, com comparação ao anterior. Seleção livre de período fica fora.
- Volume inicial permite cálculo em consulta direta, sem agregação pré-computada.
