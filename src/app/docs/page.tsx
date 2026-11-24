import Link from "next/link";
import { docs, grupos } from "@/lib/docs";

export const dynamic = "force-static";

export default function DocsIndice() {
  return (
    <>
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold leading-tight">Documentação</h1>
        <p className="text-neutral-600">
          O projeto é construído por especificação: nada é implementado antes de
          estar especificado, planejado e quebrado em tarefas. Cada documento
          abaixo é lido direto do repositório, em tempo de build.
        </p>
      </header>

      {grupos.map((grupo) => (
        <section key={grupo} className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {grupo}
          </h2>
          <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
            {docs
              .filter((d) => d.grupo === grupo)
              .map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    className="group flex items-center gap-4 py-4 transition-colors hover:bg-neutral-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{doc.titulo}</span>
                      <span className="mt-0.5 block text-sm text-neutral-600">
                        {doc.descricao}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-900"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
