# Feature Specification: Fundação e Painel do Profissional

**Feature Branch**: `001-fundacao-painel`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Fundação e painel do profissional: schema completo, auth por magic link, serviços, disponibilidade, bloqueios e pacotes"

## Contexto do Produto

A plataforma permite que o profissional autônomo — começando por barbeiros — venda
pacotes e assinaturas de serviços antecipadamente. O cliente final compra, agenda e
remarca inteiramente pelo WhatsApp, e não participa desta feature.

Esta feature entrega a base: o painel web onde o profissional define o que vende e
quando atende. Sem ela nada pode ser vendido nem agendado, porque não existe serviço,
horário ou pacote cadastrado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso sem senha e identidade do profissional (Priority: P1)

O profissional informa o e-mail, recebe um link, clica e entra. Na primeira entrada
completa nome, telefone e o apelido público (slug) que identificará o link dele para
os clientes. O fuso horário vem preenchido como America/Sao_Paulo e pode ser trocado.

**Why this priority**: sem conta não existe dono para serviço, horário ou pacote.
É o único bloco que todos os outros dependem. Senha é atrito e suporte: o público-alvo
esquece senha e não usa gerenciador.

**Independent Test**: criar conta com um e-mail, sair, entrar novamente pelo link e
encontrar o perfil preenchido. Entrega valor isolado: o profissional já tem uma conta
e um identificador público reservado.

**Acceptance Scenarios**:

1. **Given** um e-mail nunca usado, **When** o profissional solicita acesso, **Then** recebe um link de entrada válido e de uso único
2. **Given** um link de entrada já utilizado, **When** o profissional clica nele de novo, **Then** o acesso é recusado e um novo link pode ser solicitado
3. **Given** um link de entrada expirado, **When** o profissional clica nele, **Then** o acesso é recusado com mensagem clara
4. **Given** conta recém-criada sem perfil completo, **When** o profissional acessa qualquer área do painel, **Then** é levado para completar nome, telefone e slug antes de prosseguir
5. **Given** um slug já em uso por outro profissional, **When** o profissional tenta salvá-lo, **Then** o salvamento é recusado indicando que já está em uso
6. **Given** perfil completo, **When** o profissional retorna depois de dias, **Then** continua autenticado ou entra com um novo link, e encontra seus dados preservados

---

### User Story 2 - Catálogo de serviços (Priority: P2)

O profissional cadastra o que oferece: nome, quanto tempo leva e quanto custa. Pode
desativar um serviço que não oferece mais sem apagar o histórico dele.

**Why this priority**: serviço é a unidade mínima de tudo. Pacote é composto de
serviços e agendamento consome serviço. Sem catálogo não há o que vender.

**Independent Test**: cadastrar três serviços com durações diferentes, editar o preço
de um, desativar outro, e verificar que o desativado não aparece como opção
selecionável mas continua existindo.

**Acceptance Scenarios**:

1. **Given** painel autenticado, **When** o profissional cadastra um serviço com nome, duração e preço, **Then** ele aparece na lista como ativo
2. **Given** um serviço ativo, **When** o profissional altera o preço, **Then** o novo preço vale para usos futuros e não altera registros passados
3. **Given** um serviço ativo, **When** o profissional o desativa, **Then** ele deixa de ser oferecido em novas seleções mas permanece visível na gestão
4. **Given** um serviço com duração zero, negativa ou não numérica, **When** o profissional tenta salvar, **Then** o salvamento é recusado com mensagem clara
5. **Given** um serviço com preço negativo, **When** o profissional tenta salvar, **Then** o salvamento é recusado

---

### User Story 3 - Quando o profissional atende (Priority: P3)

O profissional define as faixas de horário em que trabalha, por dia da semana. Separa
intervalos que não atende — almoço, folga, férias — marcando-os como bloqueios com
data e hora.

**Why this priority**: define a oferta de horários que o bot vai mostrar ao cliente.
Vem depois do catálogo porque a duração do serviço determina como a faixa é fatiada.

**Independent Test**: definir atendimento de segunda a sábado, inserir um bloqueio de
almoço e um período de férias, e verificar que o sistema calcula corretamente as
faixas livres resultantes para uma data futura.

**Acceptance Scenarios**:

1. **Given** painel autenticado, **When** o profissional define faixa de 09:00 a 18:00 para terça, **Then** terça passa a constar como dia de atendimento nessa faixa
2. **Given** uma faixa existente para um dia, **When** o profissional adiciona outra faixa que se sobrepõe a ela no mesmo dia, **Then** o salvamento é recusado indicando a sobreposição
3. **Given** uma faixa com hora final anterior ou igual à inicial, **When** o profissional tenta salvar, **Then** o salvamento é recusado
4. **Given** faixas definidas, **When** o profissional cria um bloqueio de 12:00 a 13:00 para uma data, **Then** essa data passa a ter as faixas livres partidas em dois trechos
5. **Given** um bloqueio existente, **When** o profissional cria outro que o sobrepõe, **Then** o sistema aceita e trata a união dos dois como indisponível
6. **Given** um bloqueio inteiramente fora de qualquer faixa de atendimento, **When** o profissional salva, **Then** é aceito e não altera a disponibilidade calculada
7. **Given** disponibilidade e bloqueios definidos, **When** o sistema é consultado sobre as faixas livres de uma data, **Then** retorna os trechos corretos no fuso do profissional

---

### User Story 4 - Pacotes e assinaturas à venda (Priority: P4)

O profissional monta o que vende antecipadamente: dá um nome ao pacote, escolhe se é
compra avulsa ou assinatura mensal, define preço, prazo de validade das sessões e
quais serviços e quantas sessões de cada o pacote contém.

**Why this priority**: é o produto que gera receita, mas depende do catálogo existir
para ser composto. Pode ser entregue por último sem invalidar as anteriores.

**Independent Test**: criar um pacote avulso de 4 sessões de um serviço e uma
assinatura mensal com dois serviços diferentes, e verificar que ambos ficam publicados
com a composição correta.

**Acceptance Scenarios**:

1. **Given** três serviços ativos cadastrados, **When** o profissional cria pacote "4 cortes" com 4 sessões de um serviço, preço e validade de 30 dias, **Then** o pacote fica disponível como ativo
2. **Given** um pacote sem nenhum serviço na composição, **When** o profissional tenta ativá-lo, **Then** a ativação é recusada indicando que a composição está vazia
3. **Given** um pacote em criação, **When** o profissional escolhe assinatura mensal, **Then** o intervalo de cobrança é registrado como mensal
4. **Given** um pacote em criação, **When** o profissional não informa validade, **Then** a validade default do profissional é aplicada
5. **Given** um pacote que inclui um serviço, **When** o profissional desativa esse serviço no catálogo, **Then** o sistema alerta que há pacote ativo dependendo dele
6. **Given** um item de composição com quantidade zero ou negativa, **When** o profissional tenta salvar, **Then** o salvamento é recusado
7. **Given** um pacote ativo, **When** o profissional o desativa, **Then** ele para de ser oferecido mas permanece íntegro para consulta

---

### Edge Cases

- Profissional solicita vários links de entrada em sequência: apenas o mais recente vale, os anteriores são invalidados.
- Profissional tenta usar como slug um valor com espaço, acento, maiúscula ou caractere especial: normalizado ou recusado, nunca salvo com ambiguidade.
- Profissional tenta usar como slug um termo reservado de rota do sistema: recusado.
- Dois profissionais tentam reservar o mesmo slug simultaneamente: apenas um obtém, o outro recebe recusa clara.
- Profissional troca o fuso horário depois de ter definido disponibilidade: as faixas permanecem com os mesmos números de hora local, e o cálculo passa a usar o novo fuso.
- Profissional define atendimento que atravessa a meia-noite: recusado nesta feature, com orientação de criar duas faixas em dias distintos.
- Profissional cria bloqueio com início posterior ao fim: recusado.
- Profissional cria bloqueio de vários meses (férias longas): aceito sem limite artificial.
- Profissional apaga um serviço que compõe pacote ativo: exclusão impedida; apenas desativação é permitida.
- Profissional acessa o painel por celular com tela estreita: todas as ações permanecem completáveis.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e identidade**

- **FR-001**: O sistema MUST permitir que um profissional solicite acesso informando apenas um endereço de e-mail.
- **FR-002**: O sistema MUST enviar um link de entrada de uso único e com prazo de validade, e MUST invalidar links anteriores do mesmo e-mail quando um novo é emitido.
- **FR-003**: O sistema MUST NOT armazenar nem solicitar senha em nenhum momento.
- **FR-004**: O sistema MUST manter o profissional autenticado entre visitas por um período, e MUST permitir encerrar a sessão.
- **FR-005**: O profissional MUST informar nome, telefone e slug antes de acessar qualquer outra área do painel.
- **FR-006**: O sistema MUST garantir unicidade do slug e MUST recusar slugs com formato inválido ou reservados pelo sistema.
- **FR-007**: O sistema MUST atribuir America/Sao_Paulo como fuso default e MUST permitir alteração pelo profissional.
- **FR-008**: O sistema MUST registrar a vertical do profissional, com barbearia como default, sem expor escolha de vertical nesta feature.

**Catálogo de serviços**

- **FR-009**: O profissional MUST poder criar, listar, editar e desativar serviços, cada um com nome, duração em minutos e preço.
- **FR-010**: O sistema MUST recusar serviço com duração não positiva ou preço negativo.
- **FR-011**: O sistema MUST NOT permitir exclusão definitiva de serviço que componha algum pacote; apenas desativação.
- **FR-012**: Serviço desativado MUST deixar de ser oferecido em novas seleções e MUST permanecer consultável.

**Disponibilidade e bloqueios**

- **FR-013**: O profissional MUST poder definir uma ou mais faixas de horário de atendimento por dia da semana.
- **FR-014**: O sistema MUST recusar faixas sobrepostas no mesmo dia da semana e faixas cuja hora final não seja posterior à inicial.
- **FR-015**: O sistema MUST recusar faixa que atravesse a meia-noite, orientando o desdobramento em dois dias.
- **FR-016**: O profissional MUST poder criar, listar e remover bloqueios com início, fim e motivo opcional.
- **FR-017**: O sistema MUST recusar bloqueio cujo fim não seja posterior ao início.
- **FR-018**: O sistema MUST expor o cálculo das faixas livres de uma data, resultante da disponibilidade semanal menos os bloqueios, respeitando o fuso do profissional.
- **FR-019**: O cálculo de faixas livres MUST tratar bloqueios sobrepostos como uma única indisponibilidade.

**Pacotes**

- **FR-020**: O profissional MUST poder criar, listar, editar, ativar e desativar pacotes com nome, tipo (avulso ou assinatura mensal), preço e validade em dias.
- **FR-021**: Um pacote MUST ser composto por um ou mais itens, cada um indicando um serviço e uma quantidade de sessões.
- **FR-022**: O sistema MUST recusar ativação de pacote sem itens de composição e MUST recusar item com quantidade não positiva.
- **FR-023**: Quando a validade não for informada, o sistema MUST aplicar a validade default do profissional.
- **FR-024**: Pacote do tipo assinatura MUST registrar o intervalo de cobrança como mensal.
- **FR-025**: O sistema MUST alertar o profissional quando ele desativar serviço que componha pacote ativo.
- **FR-026**: O profissional MUST poder configurar a validade default dos pacotes e a janela mínima de cancelamento em horas.

**Isolamento e base de dados**

- **FR-027**: Toda leitura e escrita de dados de profissional MUST ser restrita ao profissional autenticado; o sistema MUST NOT expor dado de um profissional a outro em nenhuma rota ou ação.
- **FR-028**: O modelo de dados MUST ser criado por completo nesta feature, incluindo as entidades de cliente, compra, ledger de sessões, agendamento, mensagem agendada e evento de webhook, ainda que sem interface ou comportamento.
- **FR-029**: O sistema MUST impedir, por restrição do próprio banco de dados, a existência de dois agendamentos sobrepostos para o mesmo profissional, mesmo não havendo criação de agendamento nesta feature.
- **FR-030**: Toda data e hora MUST ser persistida em UTC, com conversão ao fuso do profissional apenas na entrada e na exibição.

### Key Entities

- **Professional**: o dono da conta. Nome, telefone, e-mail, slug público, fuso, vertical, validade default de pacote, janela de cancelamento, taxa de plataforma (inativa), vínculo opcional a organização (inativo).
- **Service**: algo que o profissional executa. Nome, duração, preço, situação ativa.
- **Package**: oferta vendida antecipadamente. Nome, tipo, preço, validade, situação ativa.
- **PackageItem**: a composição de um pacote — qual serviço e quantas sessões.
- **Availability**: faixa semanal recorrente de atendimento, por dia da semana.
- **TimeBlock**: intervalo pontual de indisponibilidade, com motivo opcional.
- **Organization**: agrupamento de profissionais. Existe no modelo, sem comportamento nesta feature.
- **Customer, Purchase, SessionLedger, Appointment, ScheduledMessage, WebhookEvent, WaConversation**: entidades das features seguintes. Criadas no modelo agora para que a base nasça completa, sem interface nem regra nesta feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um profissional que nunca viu o sistema conclui conta, perfil, três serviços, disponibilidade da semana, um bloqueio de almoço e um pacote publicado em menos de 10 minutos, sem ajuda e usando apenas o celular.
- **SC-002**: 100% das ações do painel são completáveis em tela de 360 pixels de largura, sem rolagem horizontal.
- **SC-003**: O cálculo de faixas livres de uma data retorna resultado correto em todos os casos cobertos por teste automatizado, incluindo bloqueio parcial, bloqueio total do dia, bloqueios sobrepostos e dia sem atendimento.
- **SC-004**: Nenhuma tentativa de acesso a dado de outro profissional obtém sucesso, verificado por teste automatizado para cada rota e ação de escrita.
- **SC-005**: Zero validações de integridade ocorrem apenas em aplicação quando o banco de dados pode garanti-las: unicidade de slug e sobreposição de agendamento são garantidas por restrição de banco.
- **SC-006**: A migration inicial aplica-se em banco vazio e é revertida sem erro.

## Assumptions

- O profissional tem e-mail acessível no celular; o link de entrada é aberto no mesmo aparelho.
- O provedor de envio de e-mail transacional é decisão técnica do plano, não requisito desta spec.
- Nenhum cliente final acessa o sistema nesta feature; não há área pública além da reserva do slug.
- Não existe pagamento, carteira de sessões, agendamento efetivo ou integração com WhatsApp nesta feature; essas capacidades são das features 002, 003 e 004.
- Um profissional corresponde a uma conta. Salão com vários profissionais é feature posterior, e o campo de organização permanece sem comportamento.
- Não há importação de dados de sistemas anteriores.
- O ambiente de desenvolvimento não dispõe de servidor de longa duração: verificação sai de build, testes automatizados e deploy de preview.
