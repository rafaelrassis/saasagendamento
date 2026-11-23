import type { Metadata } from "next";
import Link from "next/link";
import { docs, grupos } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentação — saasagendamento",
  description:
    "Constituição, decisões de produto e especificações das features do projeto.",
};

export default function DocsIndex() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="space-y-3">
        <Link
          href="/"
          className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4"
        >
          Início
        </Link>
        <h1 className="text-3xl font-semibold leading-tight">Documentação</h1>
        <p className="text-neutral-600">
          O projeto é construído por especificação: nada é implementado antes de
          estar especificado, planejado e quebrado em tarefas.
        </p>
        <p className="text-sm text-neutral-500">
          Sugestão de leitura: decisões de produto, depois a constituição, depois
          a especificação da feature 001.
        </p>
      </header>

      {grupos.map((grupo) => (
        <section key={grupo} className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {grupo}
          </h2>
          <div className="space-y-2">
            {docs
              .filter((d) => d.grupo === grupo)
              .map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="block rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-400"
                >
                  <span className="font-medium">{doc.titulo}</span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    {doc.descricao}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
