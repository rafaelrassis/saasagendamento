import { readFileSync } from "fs";
import { join } from "path";

export type Doc = {
  slug: string;
  titulo: string;
  descricao: string;
  grupo: string;
  arquivo: string;
};

// O conteúdo vive nos arquivos do repositório: estes são os mesmos documentos
// que o ciclo SDD gera, lidos em tempo de build. Não há cópia nem duplicação.
export const docs: Doc[] = [
  {
    slug: "produto",
    titulo: "Decisões de produto",
    descricao: "Modelo, custos, riscos e o que ficou fora do MVP",
    grupo: "Fundamento",
    arquivo: "docs/produto.md",
  },
  {
    slug: "constituicao",
    titulo: "Constituição",
    descricao: "Os 10 princípios do projeto, 3 deles não-negociáveis",
    grupo: "Fundamento",
    arquivo: ".specify/memory/constitution.md",
  },
  {
    slug: "001-especificacao",
    titulo: "Especificação",
    descricao: "4 user stories priorizadas, 30 requisitos funcionais",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/spec.md",
  },
  {
    slug: "001-plano",
    titulo: "Plano técnico",
    descricao: "Stack, decisões, estrutura de pastas e fases",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/plan.md",
  },
  {
    slug: "001-tarefas",
    titulo: "Tarefas",
    descricao: "65 tarefas em 7 fases, organizadas por user story",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/tasks.md",
  },
  {
    slug: "001-modelo-de-dados",
    titulo: "Modelo de dados",
    descricao: "Schema das 13 tabelas e as restrições de banco",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/data-model.md",
  },
  {
    slug: "001-pesquisa",
    titulo: "Pesquisa",
    descricao: "Alternativas consideradas e por que foram rejeitadas",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/research.md",
  },
  {
    slug: "001-setup",
    titulo: "Setup",
    descricao: "Contas, variáveis de ambiente e verificação",
    grupo: "Feature 001 — fundação e painel",
    arquivo: "specs/001-fundacao-painel/quickstart.md",
  },
  {
    slug: "002-pagamento",
    titulo: "002 — Pagamento e carteira de sessões",
    descricao: "PaymentProvider, Asaas, Pix, webhook idempotente, ledger",
    grupo: "Próximas features",
    arquivo: "specs/002-pagamento-pacotes/spec.md",
  },
  {
    slug: "003-whatsapp",
    titulo: "003 — Bot WhatsApp",
    descricao: "Cloud API, Flows, agendamento transacional",
    grupo: "Próximas features",
    arquivo: "specs/003-bot-whatsapp/spec.md",
  },
  {
    slug: "004-lembretes",
    titulo: "004 — Lembretes e expiração",
    descricao: "Cron, janela de 24h, expiração e renovação",
    grupo: "Próximas features",
    arquivo: "specs/004-lembretes-expiracao/spec.md",
  },
  {
    slug: "005-dashboard",
    titulo: "005 — Dashboard",
    descricao: "Três números e o passivo de sessões em aberto",
    grupo: "Próximas features",
    arquivo: "specs/005-dashboard/spec.md",
  },
];

export const grupos = [
  "Fundamento",
  "Feature 001 — fundação e painel",
  "Próximas features",
];

export function getDoc(slug: string): Doc | undefined {
  return docs.find((d) => d.slug === slug);
}

export function lerConteudo(doc: Doc): string {
  const bruto = readFileSync(join(process.cwd(), doc.arquivo), "utf8");
  // Remove o front-matter YAML, que não deve ser renderizado como corpo.
  return bruto.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}
