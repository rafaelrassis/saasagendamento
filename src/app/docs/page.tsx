import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { docs, grupos, lerConteudo } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentação — saasagendamento",
  description:
    "Constituição, decisões de produto e especificações das features do projeto.",
};

// Tudo é lido em tempo de build, dos mesmos arquivos do ciclo SDD.
export const dynamic = "force-static";

export default function Docs() {
  const paginas = docs.map((doc) => ({ doc, conteudo: lerConteudo(doc) }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:flex lg:gap-12 lg:py-16">
      <nav className="lg:sticky lg:top-16 lg:h-fit lg:w-64 lg:shrink-0">
        <Link
          href="/"
          className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
        >
          Início
        </Link>

        <details className="mt-4 rounded-xl border border-neutral-200 lg:border-0 lg:[&>summary]:hidden" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium lg:px-0">
            Índice da documentação
          </summary>
          <div className="space-y-5 px-4 pb-4 lg:px-0 lg:pb-0">
            {grupos.map((grupo) => (
              <div key={grupo} className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {grupo}
                </p>
                <ul className="space-y-1 text-sm">
                  {docs
                    .filter((d) => d.grupo === grupo)
                    .map((doc) => (
                      <li key={doc.slug}>
                        <a
                          href={`#${doc.slug}`}
                          className="block py-1 text-neutral-700 hover:text-neutral-950"
                        >
                          {doc.titulo}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </nav>

      <main className="mt-10 min-w-0 flex-1 lg:mt-0">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight">Documentação</h1>
          <p className="text-neutral-600">
            O projeto é construído por especificação: nada é implementado antes
            de estar especificado, planejado e quebrado em tarefas.
          </p>
        </header>

        {paginas.map(({ doc, conteudo }) => (
          <section
            key={doc.slug}
            id={doc.slug}
            className="mt-14 scroll-mt-6 border-t border-neutral-200 pt-10 first-of-type:border-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {doc.grupo}
            </p>
            <article className="prose prose-neutral mt-3 max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:leading-tight prose-h2:mt-10 prose-h2:text-xl prose-h3:text-base prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-neutral-900 prose-pre:text-xs prose-table:block prose-table:overflow-x-auto prose-table:text-sm">
              <Markdown remarkPlugins={[remarkGfm]}>{conteudo}</Markdown>
            </article>
            <a
              href="#"
              className="mt-6 inline-block text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
            >
              Voltar ao índice
            </a>
          </section>
        ))}
      </main>
    </div>
  );
}
