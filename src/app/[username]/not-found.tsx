import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";

export default function PublicProfileNotFound() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[75dvh] w-full max-w-2xl content-center gap-7">
        <Link
          href="/"
          aria-label="Ir para o início do Caleida"
          className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          <CaleidaLogo className="h-14 max-w-56" />
        </Link>
        <section className="grid gap-3 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Perfil indisponível
          </p>
          <h1 className="font-editorial text-4xl tracking-[-0.03em] sm:text-5xl">
            Não há um perfil disponível neste endereço.
          </h1>
          <p className="text-base leading-7 text-text-muted">
            O perfil pode não existir ou não estar disponível para você. O Caleida não revela
            detalhes adicionais sobre perfis privados.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Voltar para o início
          </Link>
        </section>
      </div>
    </main>
  );
}
