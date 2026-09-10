import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Feedback } from "@/components/ui/Feedback";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const hasProviderError = typeof params.error === "string" && params.error.length > 0;
  const invalidLink = !token || hasProviderError;

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
              Nova senha
            </p>
            <h1 className="mt-3 font-editorial text-4xl tracking-[-0.025em] sm:text-5xl">
              Redefina seu acesso.
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
              O link de recuperação é de uso único. O token não é armazenado pelo Caleida.
            </p>
          </div>
        </div>

        {invalidLink ? (
          <Feedback kind="alert" title="Link inválido ou expirado">
            Solicite uma nova recuperação de senha para continuar.
          </Feedback>
        ) : (
          <section
            aria-label="Formulário para redefinir senha"
            className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-8"
          >
            <ResetPasswordForm token={token} />
          </section>
        )}

        <Link
          href="/forgot-password"
          className="text-center text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          Solicitar outro link
        </Link>
      </div>
    </main>
  );
}
