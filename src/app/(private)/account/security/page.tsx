import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { RevokeOtherSessionsForm } from "@/components/auth/RevokeOtherSessionsForm";
import { RevokeSessionForm } from "@/components/auth/RevokeSessionForm";
import { Feedback } from "@/components/ui/Feedback";
import { listOwnSessionSummaries } from "@/lib/auth/session-management";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  if (!value) return "indisponível";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "indisponível" : dateFormatter.format(date);
}

export default async function AccountSecurityPage() {
  const sessionResult = await listOwnSessionSummaries();
  const hasOtherSessions = sessionResult.sessions.some((session) => !session.current);

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-5xl gap-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/app"
            aria-label="Voltar para a área privada do Caleida"
            className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <CaleidaLogo className="h-14 max-w-56" />
          </Link>
          <Link
            href="/app"
            className="text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            Voltar para o início
          </Link>
        </header>

        <section className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Segurança da conta
          </p>
          <h1 className="font-editorial text-5xl tracking-[-0.03em] sm:text-6xl">
            Senha e sessões.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-muted">
            Altere sua senha e encerre acessos que você não reconhece. Tokens de sessão não
            são exibidos nem enviados ao cliente para executar revogações.
          </p>
        </section>

        <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
          <div>
            <h2 className="font-editorial text-3xl">Alterar senha</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              A senha atual é exigida. Ao alterar, todas as outras sessões são encerradas.
            </p>
          </div>
          <ChangePasswordForm />
        </section>

        <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-6">
            <div>
              <h2 className="font-editorial text-3xl">Sessões ativas</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Consulte seus acessos e encerre uma sessão específica ou todas as outras.
              </p>
            </div>
            <RevokeOtherSessionsForm disabled={!hasOtherSessions} />
          </div>

          {sessionResult.error ? (
            <Feedback kind="alert" title="Sessões indisponíveis">
              Não foi possível consultar suas sessões agora. Faça login novamente se
              necessário e tente outra vez.
            </Feedback>
          ) : null}

          {!sessionResult.error && sessionResult.sessions.length === 0 ? (
            <Feedback kind="note" title="Nenhuma sessão listada">
              O provedor não retornou sessões ativas para esta conta.
            </Feedback>
          ) : null}

          <ul className="grid gap-4" aria-label="Sessões ativas da conta">
            {sessionResult.sessions.map((session) => (
              <li
                key={session.id}
                className="grid gap-4 rounded-2xl border border-border bg-background p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{session.device}</p>
                    {session.current ? (
                      <span className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-accent">
                        Sessão atual
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-3 grid gap-1 text-sm text-text-muted">
                    <div>
                      <dt className="inline font-semibold text-text-primary">Criada: </dt>
                      <dd className="inline">{formatDate(session.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-text-primary">
                        Última atualização: 
                      </dt>
                      <dd className="inline">{formatDate(session.updatedAt)}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-text-primary">Expira: </dt>
                      <dd className="inline">{formatDate(session.expiresAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="sm:min-w-52">
                  <RevokeSessionForm sessionId={session.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <Feedback kind="note" title="Semântica de revogação">
          Operações sensíveis são validadas pelo provedor. O cache assinado de dados de sessão
          do Caleida expira em até 1 segundo; depois desse limite, a sessão precisa ser
          revalidada no Neon Auth.
        </Feedback>
      </div>
    </main>
  );
}
