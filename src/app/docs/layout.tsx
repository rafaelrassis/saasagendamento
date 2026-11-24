import type { Metadata } from "next";
import DocsNav from "@/components/docs-nav";
import { docs, grupos } from "@/lib/docs";

export const metadata: Metadata = {
  title: {
    default: "Documentação — saasagendamento",
    template: "%s — Documentação",
  },
  description:
    "Constituição, decisões de produto e especificações das features do projeto.",
};

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="lg:flex">
      <DocsNav docs={docs} grupos={grupos} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 lg:px-12 lg:py-14">
          {children}
        </div>
      </div>
    </div>
  );
}
