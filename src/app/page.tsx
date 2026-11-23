const REPO = "https://github.com/rafaelrassis/saasagendamento/blob/main";

const fundamento = [
  {
    titulo: "Decisões de produto",
    descricao: "Modelo, custos, riscos e o que ficou fora do MVP",
    href: `${REPO}/docs/produto.md`,
  },
  {
    titulo: "Constituição",
    descricao: "Os 10 princípios do projeto, 3 deles não-negociáveis",
    href: `${REPO}/.specify/memory/constitution.md`,
  },
];

const feature001 = [
  { titulo: "Especificação", href: `${REPO}/specs/001-fundacao-painel/spec.md` },
  { titulo: "Plano técnico", href: `${REPO}/specs/001-fundacao-painel/plan.md` },
  { titulo: "65 tarefas", href: `${REPO}/specs/001-fundacao-painel/tasks.md` },
  {
    titulo: "Modelo de dados",
    href: `${REPO}/specs/001-fundacao-painel/data-model.md`,
  },
  {
    titulo: "Pesquisa",
    href: `${REPO}/specs/001-fundacao-painel/research.md`,
  },
  {
    titulo: "Setup",
    href: `${REPO}/specs/001-fundacao-painel/quickstart.md`,
  },
];

const proximas = [
  {
    numero: "002",
    titulo: "Pagamento e carteira",
    href: `${REPO}/specs/002-pagamento-pacotes/spec.md`,
  },
  {
    numero: "003",
    titulo: "Bot WhatsApp",
    href: `${REPO}/specs/003-bot-whatsapp/spec.md`,
  },
  {
    numero: "004",
    titulo: "Lembretes e expiração",
    href: `${REPO}/specs/004-lembretes-expiracao/spec.md`,
  },
  {
    numero: "005",
    titulo: "Dashboard",
    href: `${REPO}/specs/005-dashboard/spec.md`,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Em construção
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          Venda seus pacotes. O cliente agenda pelo WhatsApp.
        </h1>
        <p className="text-neutral-600">
          Receba antes de atender e tenha previsibilidade de receita todo mês.
        </p>
      </header>

      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Comece por aqui
        </h2>
        {fundamento.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-400"
          >
            <span className="font-medium">{item.titulo}</span>
            <span className="mt-1 block text-sm text-neutral-600">
              {item.descricao}
            </span>
          </a>
        ))}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Feature 001 — fundação e painel
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {feature001.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition-colors hover:border-neutral-400"
            >
              {item.titulo}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Próximas features
        </h2>
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {proximas.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-baseline gap-3 px-4 py-3 text-sm transition-colors hover:bg-neutral-50"
              >
                <span className="font-mono text-xs text-neutral-400">
                  {item.numero}
                </span>
                <span>{item.titulo}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
        <p>
          O painel do profissional está sendo construído. Nada aqui ainda recebe
          cadastro ou pagamento.
        </p>
        <a
          href="https://github.com/rafaelrassis/saasagendamento"
          className="mt-3 inline-block underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
        >
          Repositório no GitHub
        </a>
      </footer>
    </main>
  );
}
