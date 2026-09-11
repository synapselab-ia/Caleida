import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { PasswordRecoveryForm } from "@/components/auth/PasswordRecoveryForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-md content-center gap-8">
        <div className="grid gap-5">
          <Link
            href="/login"
            aria-label="Voltar para o login do Caleida"
            className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <CaleidaLogo className="h-14 max-w-56" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Recuperação de acesso
            </p>
            <h1 className="mt-3 font-editorial text-4xl tracking-[-0.025em] sm:text-5xl">
              Esqueceu sua senha?
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
              Informe o e-mail da conta. A resposta é deliberadamente genérica para não
              revelar se um endereço está cadastrado.
            </p>
          </div>
        </div>

        <section
          aria-label="Formulário de recuperação de senha"
          className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-8"
        >
          <PasswordRecoveryForm />
        </section>

        <Link
          href="/login"
          className="text-center text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
