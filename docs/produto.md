# Especificação de produto

> Decisões de negócio e produto. **Não é gerada nem sobrescrita pelo Spec Kit.**
> Em conflito entre este documento e a spec de uma feature, a divergência é resolvida
> explicitamente antes de implementar.
>
> Atualizado: 2026-11-23

## O problema

O profissional autônomo de serviço — barbeiro, manicure, esteticista — vive de fluxo
diário: fatura quando alguém aparece. Não tem previsibilidade, não tem caixa para
planejar, e perde receita com falta sem aviso.

Sistema de agenda não resolve isso, e existe de graça em abundância. O que falta é
**vender antes**.

## O produto

O profissional publica pacotes e assinaturas. O cliente compra antecipado via Pix,
recebe uma carteira de sessões, e usa agendando pelo WhatsApp.

```
descobre → compra pacote (Pix) → carteira de sessões → agenda pelo WhatsApp
         → profissional dá baixa → lembrete / renovação
```

## Decisões

| Tema | Decisão |
|---|---|
| Tenant | Profissional individual. `organizationId` nullable para migrar a salão sem quebra |
| Vertical | Schema neutro + campo `vertical`. **Posicionamento é barbearia.** Manicure e estética depois, sem tocar no núcleo |
| Front | Um só, com dicionário de termos por vertical. Nunca dois deploys |
| Monetização | Grátis agora. `platformFeeBps` no schema, desligado |
| Dinheiro da venda | Vai para a conta do profissional. A plataforma **nunca** é titular |
| Gateway | Camada `PaymentProvider`; primeira implementação Asaas (Pix nativo, Pix Automático, split, subconta) |
| Canal do cliente | WhatsApp 100% — Cloud API oficial + Flows. Sem app, sem senha |
| Número de WhatsApp | Número único da plataforma. Bot se apresenta pelo nome do profissional. Número próprio vira feature do plano pago |
| Canal do profissional | Painel web mobile-first |
| Identidade do cliente | Telefone. O WhatsApp autentica — sem login, sem OTP |
| Expiração de sessões | Expira no fim do ciclo; validade parametrizável por profissional. Sem rollover no MVP |
| Lembretes | 24h e 2h antes, com otimização de janela (abaixo) |

### Por que a plataforma não custodia o dinheiro

Quem recebe o pagamento de um serviço antecipado responde pelo serviço não entregue,
por chargeback e pela obrigação fiscal. Se o barbeiro fechar as portas com sessões
vendidas e o dinheiro tiver passado pela conta da plataforma, o passivo é da
plataforma — que não corta cabelo e não pode assumi-lo. Com o valor indo direto para a
subconta do profissional, a exposição é reputacional, não financeira.

A monetização futura entra como taxa de split no provedor, não como repasse manual.

## Custo de operação

| Item | Custo |
|---|---|
| Vercel Hobby + Neon free | R$ 0 — migrar ao monetizar; Hobby proíbe uso comercial |
| Domínio `.com.br` | ~R$ 40/ano |
| WhatsApp: mensagem do cliente, e 1.000 de serviço/mês | R$ 0 |
| WhatsApp: template utility | R$ 0,035/msg |
| Asaas: R$ 1,99 por Pix recebido | **R$ 0 para a plataforma** — é do profissional |

Com 10 profissionais ativos: cerca de R$ 20/mês.

### Otimização de custo obrigatória

Antes de enviar mensagem proativa, checar `Customer.lastInboundAt`:

- **menos de 24h** → mensagem livre, entra nas 1.000 de serviço grátis
- **24h ou mais** → template utility, R$ 0,035

Em 1.200 agendamentos/mês isso é a diferença entre ~R$ 84 e ~R$ 20. Mensagem proativa
sem essa checagem é defeito, não otimização pendente.

Textos de template não usam linguagem promocional: reclassificação de Utility para
Marketing multiplica o custo por nove.

## Riscos

| Risco | Mitigação |
|---|---|
| Aprovação da Meta trava o lançamento | Abrir Business Manager no dia 1; o painel funciona sem WhatsApp |
| Expiração seca gera churn no mês 2 | Template de aviso antes de expirar — vira agendamento, não reclamação |
| Profissional abandona a plataforma com sessões vendidas | Dinheiro já está com ele; painel mostra o passivo de sessões em aberto |
| Double-booking | Constraint no banco, não validação em aplicação |
| Divergência de saldo | Ledger append-only com trigger, `WebhookEvent` idempotente, reconciliação diária |
| Cliente troca de número | Telefone é identidade — fluxo de migração manual no painel |
| Número único dilui a marca do profissional | Bot se apresenta pelo nome dele; número próprio vira upsell |

## Caminho crítico

Burocrático, não técnico: **verificação do negócio na Meta e aprovação de templates**.
Leva semanas e não depende de código. Abrir antes de a feature 001 terminar.

O chip usado na Cloud API perde o WhatsApp comum — usar número novo ou descartável.
Credenciais devem usar token de System User: token de usuário expira em 60 dias e
derruba o bot sem aviso.

## Templates da Meta a submeter

Todos categoria Utility.

| Nome | Texto |
|---|---|
| `lembrete_24h` | Oi {{1}}! Seu {{2}} está marcado para amanhã às {{3}} com {{4}}. Se precisar remarcar, responda aqui. |
| `lembrete_2h` | {{1}}, seu {{2}} é hoje às {{3}}. Até logo! |
| `pagamento_confirmado` | Pagamento confirmado, {{1}}. Você tem {{2}} sessões disponíveis até {{3}}. Responda aqui para agendar. |
| `agendamento_confirmado` | Agendado: {{1}} em {{2}} às {{3}} com {{4}}. Saldo restante: {{5}} sessões. |
| `sessao_expirando` | {{1}}, você tem {{2}} sessão(ões) do seu pacote que expiram em {{3}}. Responda aqui para agendar. |
| `pacote_renovado` | Seu pacote {{1}} foi renovado. {{2}} sessões novas disponíveis até {{3}}. |
| `pagamento_falhou` | {{1}}, não conseguimos confirmar o pagamento do seu pacote {{2}}. Link para tentar de novo: {{3}} |
| `cancelado_pelo_profissional` | {{1}}, {{2}} precisou cancelar seu horário de {{3}}. Sua sessão foi devolvida. Responda aqui para reagendar. |

## Fora do MVP, deliberadamente

**Outras verticais, quando chegar a hora**

- `location` no agendamento e tempo de deslocamento — manicure em domicílio
- `Resource` (cadeira, maca, cabine) — conflito que não é do profissional
- Intervalo mínimo entre sessões — carência clínica em estética
- Serviço simultâneo — mão e pé com duas profissionais
- Seed de serviços e pacotes prontos por vertical — onboarding de 30 segundos

**Produto**

- Rollover de sessões com teto
- Sessão bônus automática quando o profissional cancela
- "Você já economizou R$ X vs. avulso" na carteira
- Lista de espera por horário
- Indicação: cliente que traz amigo ganha sessão
- Multi-profissional e comissão (salão)
- Número de WhatsApp próprio como feature paga
- Antecipação de recebíveis de pacote anual

Nada daqui entra — nem como campo de schema não usado — sem decisão registrada na spec
da feature.
