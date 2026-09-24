import Link from "next/link";
import { redirect } from "next/navigation";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { DeactivateAccountForm } from "@/components/account/DeactivateAccountForm";
import { ReactivateAccountForm } from "@/components/account/ReactivateAccountForm";
import { LogoutForm } from "@/components/auth/LogoutForm";
import { Feedback } from "@/components/ui/Feedback";
import {
  getProductAccountLifecycle,
  sessionStartedAfterDeactivation,
} from "@/lib/account/lifecycle";
import { getServerSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null) {
  if (!value) return "indisponível";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "indisponível" : dateFormatter.format(date);
}

export default async function AccountLifecyclePage() {
  const session = await getServerSession().catch(() => null);
  if (!session?.user || !session.session) redirect("/login");

  const result = await getProductAccountLifecycle(session.user.id)
    .then((lifecycle) => ({ lifecycle, error: false as const }))
    .catch(() => ({ lifecycle: null, error: true as const }));

  if (result.error || !result.lifecycle) {
    return (
      <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
        <div className="mx-auto grid min-h-[70dvh] w-full max-w-2xl content-center gap-6">
          <CaleidaLogo className="h-14 max-w-56" />
          <Feedback kind="alert" title="Estado da conta indisponível">
            Não foi possível confirmar se sua conta está ativa. O acesso normal permanece bloqueado por segurança.
          </Feedback>
          <LogoutForm />
        </div>
      </main>
    );
  }

  const { lifecycle } = result;
  const deactivated = lifecycle.status === "deactivated";
  const freshSession =
    deactivated &&
    sessionStartedAfterDeactivation(
      session.session.createdAt,
      lifecycle.deactivatedAt,
    );

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-3xl gap-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <CaleidaLogo className="h-14 max-w-56" />
          {!deactivated ? (
            <Link
              href="/app"
              className="text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              Voltar para o início
            </Link>
          ) : (
            <div className="sm:min-w-28">
              <LogoutForm />
            </div>
          )}
        </header>

        <section className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Ciclo da conta
          </p>
          <h1 className="font-editorial text-5xl tracking-[-0.03em] sm:text-6xl">
            {deactivated ? "Conta desativada." : "Desativação da conta."}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-muted">
            {deactivated
              ? "Seus dados continuam preservados. Enquanto a conta estiver desativada, seu perfil fica oculto e as áreas privadas normais não podem ser usadas."
              : "A desativação é reversível. Ela não apaga seu perfil, bloqueios ou identidade e pode ser revertida após um novo login."}
          </p>
        </section>

        {deactivated ? (
          <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
            <div className="grid gap-2">
              <h2 className="font-editorial text-3xl">Reativação</h2>
              <p className="text-sm leading-6 text-text-muted">
                Desativada em {formatDate(lifecycle.deactivatedAt)}.
              </p>
            </div>

            {freshSession ? (
              <>
                <Feedback kind="note" title="Novo login confirmado">
                  Ao reativar, o Caleida encerra outras sessões antes de restaurar o acesso normal.
                </Feedback>
                <ReactivateAccountForm />
              </>
            ) : (
              <Feedback kind="alert" title="Novo login necessário">
                Esta sessão começou antes da desativação. Encerre a sessão e faça login novamente para reativar.
              </Feedback>
            )}

            <Feedback kind="note" title="Encerramento definitivo">
              Solicitação, exportação e finalização de exclusão não fazem parte desta etapa e não são executadas por esta tela.
            </Feedback>
          </section>
        ) : (
          <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
            <div>
              <h2 className="font-editorial text-3xl">Desativar temporariamente</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                A ação encerra suas sessões, oculta o perfil de terceiros e preserva seus dados para uma reativação posterior.
              </p>
            </div>
            <DeactivateAccountForm />
          </section>
        )}
      </div>
    </main>
  );
}
