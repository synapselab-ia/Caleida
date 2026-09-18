"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

export default function PublicProfileError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[70dvh] w-full max-w-2xl content-center gap-6">
        <Feedback kind="alert" title="Não foi possível carregar o perfil">
          O Caleida encontrou uma falha ao consultar esta página. Nenhum dado privado foi exibido.
        </Feedback>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            Tentar novamente
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
