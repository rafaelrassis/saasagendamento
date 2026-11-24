import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Conteudo, { slugificar } from "@/components/markdown";
import { docs, getDoc, lerConteudo, secoes, vizinhos } from "@/lib/docs";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return { title: doc.titulo, description: doc.descricao };
}

export default async function DocPagina({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const conteudo = lerConteudo(doc);
  const titulos = secoes(conteudo);
  const { anterior, proximo } = vizinhos(doc.slug);

  return (
    <>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {doc.grupo}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">{doc.titulo}</h1>
        <p className="text-neutral-600">{doc.descricao}</p>
        <p className="pt-1 text-xs text-neutral-500">
          Fonte:{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5">
            {doc.arquivo}
          </code>
        </p>
      </header>

      {titulos.length >= 3 && (
        <nav
          aria-label="Nesta página"
          className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Nesta página
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {titulos.map((titulo) => (
              <li key={titulo}>
                <a
                  href={`#${slugificar(titulo)}`}
                  className="text-neutral-700 hover:text-neutral-950 hover:underline"
                >
                  {titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-8">
        <Conteudo markdown={conteudo} />
      </div>

      <nav className="mt-14 grid gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/docs/${anterior.slug}`}
            className="rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-400"
          >
            <span className="block text-xs text-neutral-500">Anterior</span>
            <span className="mt-1 block text-sm font-medium">
              {anterior.titulo}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {proximo && (
          <Link
            href={`/docs/${proximo.slug}`}
            className="rounded-xl border border-neutral-200 p-4 text-right transition-colors hover:border-neutral-400 sm:col-start-2"
          >
            <span className="block text-xs text-neutral-500">Próximo</span>
            <span className="mt-1 block text-sm font-medium">
              {proximo.titulo}
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}
