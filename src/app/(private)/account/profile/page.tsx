import Link from "next/link";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Feedback } from "@/components/ui/Feedback";
import { getOwnProfile } from "@/lib/profile/data-api";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const result = await getOwnProfile()
    .then((profile) => ({ profile, error: false as const }))
    .catch(() => ({ profile: null, error: true as const }));

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
              href="/account/security"
              className="underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              Segurança
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
            Perfil privado
          </p>
          <h1 className="font-editorial text-5xl tracking-[-0.03em] sm:text-6xl">
            Sua identidade no Caleida.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-muted">
            Defina seu nome, biografia, cor de destaque, links e categorias culturais favoritas.
            Nesta etapa, todo o perfil continua visível somente para você.
          </p>
        </section>

        {result.error ? (
          <Feedback kind="alert" title="Perfil indisponível">
            Não foi possível consultar seu perfil agora. Nenhuma alteração foi feita. Tente
            novamente mais tarde ou entre novamente se sua sessão tiver expirado.
          </Feedback>
        ) : (
          <section className="grid gap-6 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
            <div>
              <h2 className="font-editorial text-3xl">
                {result.profile ? "Editar perfil" : "Criar perfil"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                O vínculo com sua identidade autenticada é definido pelo servidor e pelo banco.
                Ele não pode ser escolhido ou transferido pelo formulário.
              </p>
            </div>

            {!result.profile ? (
              <Feedback kind="note" title="Perfil ainda não criado">
                Salve os campos abaixo para materializar seu perfil privado pela primeira vez.
              </Feedback>
            ) : (
              <Feedback kind="note" title="Visibilidade atual: somente você">
                A publicação para outras pessoas pertence à próxima Story. Esta tela não oferece
                visibilidade pública antecipadamente.
              </Feedback>
            )}

            <ProfileForm
              username={result.profile?.username}
              displayName={result.profile?.displayName}
              biography={result.profile?.biography}
              accentToken={result.profile?.accentToken}
              links={result.profile?.links}
              favoriteCategories={result.profile?.favoriteCategories}
            />
          </section>
        )}
      </div>
    </main>
  );
}
