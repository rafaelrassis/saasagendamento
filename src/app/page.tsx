import Link from "next/link";

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

      <Link
        href="/docs"
        className="mt-8 block rounded-xl border border-neutral-900 bg-neutral-900 p-4 text-white transition-colors hover:bg-neutral-800"
      >
        <span className="font-medium">Documentação do projeto</span>
        <span className="mt-1 block text-sm text-neutral-300">
          Constituição, decisões de produto e as especificações das cinco
          features
        </span>
      </Link>

      <footer className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
        O painel do profissional está sendo construído. Nada aqui ainda recebe
        cadastro ou pagamento.
      </footer>
    </main>
  );
}
