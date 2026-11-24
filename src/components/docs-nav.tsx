"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Doc } from "@/lib/docs";

type Props = { docs: Doc[]; grupos: string[] };

export default function DocsNav({ docs, grupos }: Props) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  // Com a gaveta aberta o corpo não rola, senão o fundo escorrega sob o dedo.
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  const atual = docs.find((d) => pathname === `/docs/${d.slug}`);

  // Navegar fecha a gaveta: no celular o clique no link já é a confirmação.
  const fechar = () => setAberto(false);

  const lista = (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/"
          onClick={fechar}
          className="block text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Início
        </Link>
        <Link
          href="/docs"
          onClick={fechar}
          aria-current={pathname === "/docs" ? "page" : undefined}
          className={`block rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
            pathname === "/docs"
              ? "bg-neutral-900 text-white"
              : "text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Visão geral
        </Link>
      </div>

      {grupos.map((grupo) => (
        <div key={grupo} className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {grupo}
          </p>
          <ul>
            {docs
              .filter((d) => d.grupo === grupo)
              .map((doc) => {
                const ativo = pathname === `/docs/${doc.slug}`;
                return (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      onClick={fechar}
                      aria-current={ativo ? "page" : undefined}
                      className={`block rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        ativo
                          ? "bg-neutral-900 font-medium text-white"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      }`}
                    >
                      {doc.titulo}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Celular: barra fixa com hamburger. */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir índice da documentação"
          aria-expanded={aberto}
          aria-controls="gaveta-docs"
          className="-ml-1 inline-flex size-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {atual ? atual.titulo : "Documentação"}
          </p>
          {atual && (
            <p className="truncate text-xs text-neutral-500">{atual.grupo}</p>
          )}
        </div>
      </div>

      {/* Celular: gaveta. */}
      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar índice"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-neutral-950/40"
          />
          <nav
            id="gaveta-docs"
            aria-label="Índice da documentação"
            className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto overscroll-contain bg-white p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Documentação</p>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar índice"
                className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {lista}
          </nav>
        </div>
      )}

      {/* Desktop: lateral fixa. */}
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-neutral-200 lg:px-5 lg:py-8">
        <nav aria-label="Índice da documentação">{lista}</nav>
      </aside>
    </>
  );
}
