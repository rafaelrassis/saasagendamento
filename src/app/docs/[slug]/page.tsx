import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { docs, getDoc, lerConteudo } from "@/lib/docs";

type Params = { slug: string };

// Leitura de arquivo acontece só em tempo de build. force-static impede que
// estas rotas virem dinâmicas por acidente, o que faria o fs falhar em runtime.
// dynamicParams false faz slug desconhecido responder 404 em vez de tentar ler.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Documento não encontrado" };
  return { title: `${doc.titulo} — saasagendamento`, description: doc.descricao };
}

export default async function DocPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const conteudo = lerConteudo(doc);
  const indice = docs.findIndex((d) => d.slug === slug);
  const anterior = indice > 0 ? docs[indice - 1] : undefined;
  const proximo = indice < docs.length - 1 ? docs[indice + 1] : undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
        <Link
          href="/docs"
          className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
        >
          Documentação
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-400">{doc.grupo}</span>
      </nav>

      <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h1:leading-tight prose-h2:mt-10 prose-h2:text-xl prose-h3:text-base prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-neutral-900 prose-pre:text-xs prose-table:block prose-table:overflow-x-auto prose-table:text-sm">
        <Markdown remarkPlugins={[remarkGfm]}>{conteudo}</Markdown>
      </article>

      <nav className="mt-12 grid gap-2 border-t border-neutral-200 pt-6 text-sm sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/docs/${anterior.slug}`}
            className="rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-400"
          >
            <span className="block text-xs text-neutral-500">Anterior</span>
            {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {proximo && (
          <Link
            href={`/docs/${proximo.slug}`}
            className="rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-400 sm:text-right"
          >
            <span className="block text-xs text-neutral-500">Próximo</span>
            {proximo.titulo}
          </Link>
        )}
      </nav>
    </main>
  );
}
