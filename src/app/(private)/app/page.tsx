import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { LogoutForm } from "@/components/auth/LogoutForm";

export default function PrivateHomePage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <CaleidaLogo className="h-14 max-w-56" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/account/security"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Segurança da conta
            </Link>
            <div className="sm:min-w-28">
              <LogoutForm />
            </div>
          </div>
        </header>

        <section className="grid flex-1 content-center gap-6 py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Área privada
          </p>
          <h1 className="max-w-3xl font-editorial text-5xl leading-tight tracking-[-0.03em] sm:text-6xl">
            Sua sessão está protegida no servidor.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
            O acesso autenticado já inclui recuperação de senha e controle das sessões.
            Biblioteca, catálogo pessoal e demais domínios entram apenas nas Stories
            correspondentes.
          </p>
        </section>
      </div>
    </main>
  );
}
