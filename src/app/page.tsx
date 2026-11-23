export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Em construção
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          Venda seus pacotes. O cliente agenda pelo WhatsApp.
        </h1>
        <p className="text-neutral-600">
          Receba antes de atender e tenha previsibilidade de receita todo mês.
        </p>
      </div>
      <div className="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-600">
        O painel do profissional está sendo construído. Nada aqui ainda recebe
        cadastro ou pagamento.
      </div>
    </main>
  );
}
