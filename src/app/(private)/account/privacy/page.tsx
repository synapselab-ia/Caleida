import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { ProfileBlockForm } from "@/components/profile/ProfileBlockForm";
import { ProfileUnblockForm } from "@/components/profile/ProfileUnblockForm";
import { Feedback } from "@/components/ui/Feedback";
import { listOwnProfileBlocks } from "@/lib/profile/blocks-data-api";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

export default async function AccountPrivacyPage() {
  const result = await listOwnProfileBlocks()
    .then((blocks) => ({ blocks, error: false as const }))
    .catch(() => ({ blocks: [], error: true as const }));

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-4xl gap-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/app"
            aria-label="Voltar para a área privada do Caleida"
            className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <CaleidaLogo className="h-14 max-w-56" />
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link
              href="/account/profile"
              className="underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              Perfil
            </Link>
            <Link
              href="/app"
              className="underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              Voltar para o início
            </Link>
          </nav>
        </header>

        <section className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Privacidade
          </p>
          <h1 className="font-editorial text-5xl tracking-[-0.03em] sm:text-6xl">
            Bloqueios de perfil.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-muted">
            Quando você bloqueia uma conta, os dois perfis deixam de ficar acessíveis entre essas
            identidades autenticadas, mesmo se estiverem públicos. A publicação para visitantes
            anônimos continua seguindo a visibilidade do perfil.
          </p>
        </section>

        {result.error ? (
          <Feedback kind="alert" title="Bloqueios indisponíveis">
            Não foi possível consultar sua lista de bloqueios agora. Nenhuma alteração foi feita.
          </Feedback>
        ) : (
          <>
            <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
              <div>
                <h2 className="font-editorial text-3xl">Bloquear um perfil</h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Use o nome de usuário de um perfil que esteja disponível para sua conta.
                </p>
              </div>
              <ProfileBlockForm />
            </section>

            <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
              <div>
                <h2 className="font-editorial text-3xl">Perfis bloqueados</h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Somente você pode consultar e remover os bloqueios criados pela sua conta.
                </p>
              </div>

              {result.blocks.length === 0 ? (
                <Feedback kind="note" title="Nenhum perfil bloqueado">
                  Sua lista de bloqueios está vazia.
                </Feedback>
              ) : (
                <ul className="grid gap-4">
                  {result.blocks.map((block) => (
                    <li
                      key={block.blockedAuthUserId}
                      className="grid gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary">@{block.blockedUsername}</p>
                        <p className="mt-1 text-sm text-text-muted">
                          Bloqueado em {dateFormatter.format(new Date(block.createdAt))}
                        </p>
                      </div>
                      <ProfileUnblockForm
                        blockedAuthUserId={block.blockedAuthUserId}
                        blockedUsername={block.blockedUsername}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
