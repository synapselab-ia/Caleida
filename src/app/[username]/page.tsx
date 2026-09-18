import Link from "next/link";
import { notFound } from "next/navigation";

import { CaleidaLogo } from "@/components/brand/CaleidaLogo";
import { getVisibleProfileByUsername } from "@/lib/profile/data-api";
import type { ProfileAccentToken, ProfileCategory } from "@/lib/profile/personalization";

export const dynamic = "force-dynamic";

const accentClassByToken: Record<ProfileAccentToken, string> = {
  violet: "text-brand-violet",
  magenta: "text-brand-magenta",
  blue: "text-brand-blue",
  green: "text-brand-green",
  amber: "text-brand-amber",
};

const categoryPresentation: Record<
  ProfileCategory,
  { label: string; markerClassName: string }
> = {
  book: { label: "Livro", markerClassName: "bg-category-book" },
  manga: { label: "Mangá", markerClassName: "bg-category-manga" },
  manhwa: { label: "Manhwa", markerClassName: "bg-category-manhwa" },
  manhua: { label: "Manhua", markerClassName: "bg-category-manhua" },
  movie: { label: "Filme", markerClassName: "bg-category-movie" },
  series: { label: "Série", markerClassName: "bg-category-series" },
  anime: { label: "Anime", markerClassName: "bg-category-anime" },
};

function linkLabel(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return link;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getVisibleProfileByUsername(username);

  if (!profile) notFound();

  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-4xl gap-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            aria-label="Ir para o início do Caleida"
            className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <CaleidaLogo className="h-14 max-w-56" />
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Entrar
          </Link>
        </header>

        <article className="grid gap-8 rounded-[2rem] border border-border bg-surface p-6 sm:p-8 lg:p-10">
          <header className="grid gap-3">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentClassByToken[profile.accentToken]}`}
            >
              Perfil Caleida
            </p>
            <h1 className="font-editorial text-5xl leading-tight tracking-[-0.03em] sm:text-6xl">
              {profile.displayName}
            </h1>
            <p className="text-sm font-semibold text-text-muted">@{profile.username}</p>
          </header>

          {profile.biography ? (
            <section aria-labelledby="profile-biography-heading" className="grid gap-2">
              <h2 id="profile-biography-heading" className="text-sm font-semibold text-text-primary">
                Sobre
              </h2>
              <p className="max-w-3xl whitespace-pre-wrap text-base leading-7 text-text-muted">
                {profile.biography}
              </p>
            </section>
          ) : null}

          {profile.favoriteCategories.length > 0 ? (
            <section aria-labelledby="profile-categories-heading" className="grid gap-3">
              <h2 id="profile-categories-heading" className="text-sm font-semibold text-text-primary">
                Categorias favoritas
              </h2>
              <ul className="flex flex-wrap gap-2">
                {profile.favoriteCategories.map((category) => {
                  const presentation = categoryPresentation[category];
                  return (
                    <li
                      key={category}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-sm font-semibold text-text-primary"
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2.5 rounded-full ${presentation.markerClassName}`}
                      />
                      {presentation.label}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {profile.links.length > 0 ? (
            <section aria-labelledby="profile-links-heading" className="grid gap-3">
              <h2 id="profile-links-heading" className="text-sm font-semibold text-text-primary">
                Links
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {profile.links.map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 w-full items-center rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-text-primary underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {linkLabel(link)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        <footer className="border-t border-border pt-5 text-xs leading-5 text-text-muted">
          <p>Este perfil mostra somente informações que o usuário escolheu publicar.</p>
        </footer>
      </div>
    </main>
  );
}
