import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Sem rehype-slug: os ids saem daqui, para não acrescentar dependência.
export function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function textoDe(no: ReactNode): string {
  if (no === null || no === undefined || typeof no === "boolean") return "";
  if (typeof no === "string" || typeof no === "number") return String(no);
  if (Array.isArray(no)) return no.map(textoDe).join("");
  if (typeof no === "object" && "props" in no) {
    return textoDe((no as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function titulo(nivel: 2 | 3) {
  const Tag = (nivel === 2 ? "h2" : "h3") as "h2" | "h3";
  return function Titulo({ children }: { children?: ReactNode }) {
    return (
      <Tag id={slugificar(textoDe(children))} className="scroll-mt-20">
        {children}
      </Tag>
    );
  };
}

export default function Conteudo({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:leading-tight prose-h2:mt-10 prose-h2:text-xl prose-h3:text-base prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-neutral-900 prose-pre:text-xs prose-table:block prose-table:overflow-x-auto prose-table:text-sm prose-img:rounded-xl">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{ h2: titulo(2), h3: titulo(3) }}
      >
        {markdown}
      </Markdown>
    </article>
  );
}
