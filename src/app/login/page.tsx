import Link from "next/link";
import { redirect } from "next/navigation";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { Feedback } from "@/components/ui/Feedback";
import { getServerSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    loggedOut?: string | string[];
    reset?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession().catch(() => null);
  if (session?.user) redirect("/app");

  const params = await searchParams;
  const loggedOut = params.loggedOut === "1";
  const reset = params.reset === "1";

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-md content-center gap-8">
        <div className="grid gap-5">
          <Link
            href="/"
            aria-label="Voltar para o início do Caleida"
            className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <CaleidaLogo className="h-14 max-w-56" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Acesso ao beta
            </p>
            <h1 className="mt-3 font-editorial text-4xl tracking-[-0.025em] sm:text-5xl">
              Entre no Caleida.
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
              Use a conta já autorizada e confirmada para acessar sua área privada.
            </p>
          </div>
        </div>

        {loggedOut ? (
          <Feedback kind="status" title="Sessão encerrada">
            Você saiu do Caleida com segurança.
          </Feedback>
        ) : null}

        {reset ? (
          <Feedback kind="status" title="Senha redefinida">
            Sua nova senha já pode ser usada para entrar.
          </Feedback>
        ) : null}

        <section
          aria-label="Formulário de login"
          className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-8"
        >
          <LoginForm />
          <Link
            href="/forgot-password"
            className="mt-5 block text-center text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            Esqueci minha senha
          </Link>
        </section>
      </div>
    </main>
  );
}
