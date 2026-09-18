"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";
import { saveProfileAction, type ProfileActionState } from "@/lib/profile/actions";
import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_CATEGORY_MAX_COUNT,
  PROFILE_LINK_MAX_COUNT,
  PROFILE_ACCENT_TOKENS,
  PROFILE_CATEGORIES,
  type ProfileAccentToken,
  type ProfileCategory,
} from "@/lib/profile/personalization";

const initialState: ProfileActionState = { status: "idle" };

const accentOptions: Array<{
  value: ProfileAccentToken;
  label: string;
  swatchClassName: string;
}> = [
  { value: "violet", label: "Violeta", swatchClassName: "bg-brand-violet" },
  { value: "magenta", label: "Magenta", swatchClassName: "bg-brand-magenta" },
  { value: "blue", label: "Azul", swatchClassName: "bg-brand-blue" },
  { value: "green", label: "Verde", swatchClassName: "bg-brand-green" },
  { value: "amber", label: "Âmbar", swatchClassName: "bg-brand-amber" },
];

const categoryLabels: Record<ProfileCategory, string> = {
  book: "Livro",
  manga: "Mangá",
  manhwa: "Manhwa",
  manhua: "Manhua",
  movie: "Filme",
  series: "Série",
  anime: "Anime",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-text-primary">
      <span className="font-semibold">Erro:</span> {message}
    </p>
  );
}

export function ProfileForm({
  username,
  displayName,
  biography = "",
  accentToken = "violet",
  links = [],
  favoriteCategories = [],
}: {
  username?: string;
  displayName?: string;
  biography?: string;
  accentToken?: ProfileAccentToken;
  links?: string[];
  favoriteCategories?: ProfileCategory[];
}) {
  const [state, action, isPending] = useActionState(saveProfileAction, initialState);
  const biographyErrorId = "profile-biography-error";
  const linksErrorId = "profile-links-error";
  const accentErrorId = "profile-accent-error";
  const categoriesErrorId = "profile-categories-error";

  return (
    <form action={action} className="grid gap-7" aria-busy={isPending}>
      <FormField
        id="profile-username"
        name="username"
        label="Nome de usuário"
        description="De 3 a 30 caracteres. Use letras minúsculas, números ou sublinhado."
        type="text"
        autoComplete="username"
        minLength={3}
        maxLength={30}
        pattern="[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])"
        defaultValue={username}
        error={state.fieldErrors?.username}
        required
        disabled={isPending}
      />

      <FormField
        id="profile-display-name"
        name="displayName"
        label="Nome de exibição"
        description="É o nome que o Caleida usará para representar você dentro do produto."
        type="text"
        autoComplete="name"
        minLength={1}
        maxLength={80}
        defaultValue={displayName}
        error={state.fieldErrors?.displayName}
        required
        disabled={isPending}
      />

      <div className="grid gap-2">
        <label htmlFor="profile-biography" className="text-sm font-semibold text-text-primary">
          Biografia
        </label>
        <p id="profile-biography-description" className="text-sm text-text-muted">
          Um resumo curto sobre você, com até {PROFILE_BIO_MAX_LENGTH} caracteres.
        </p>
        <textarea
          id="profile-biography"
          name="biography"
          rows={5}
          maxLength={PROFILE_BIO_MAX_LENGTH}
          defaultValue={biography}
          aria-describedby={[
            "profile-biography-description",
            state.fieldErrors?.biography ? biographyErrorId : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={state.fieldErrors?.biography ? true : undefined}
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted disabled:opacity-70"
        />
        <FieldError id={biographyErrorId} message={state.fieldErrors?.biography} />
      </div>

      <fieldset className="grid gap-3" aria-describedby={state.fieldErrors?.accentToken ? accentErrorId : undefined}>
        <legend className="text-sm font-semibold text-text-primary">Cor de destaque</legend>
        <p className="text-sm text-text-muted">
          A cor é uma preferência visual. Texto e estado de seleção continuam identificados sem depender só dela.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accentOptions.map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus"
            >
              <input
                type="radio"
                name="accentToken"
                value={option.value}
                defaultChecked={accentToken === option.value}
                disabled={isPending}
                className="h-4 w-4"
              />
              <span
                aria-hidden="true"
                className={`h-5 w-5 rounded-full border border-border ${option.swatchClassName}`}
              />
              <span className="text-sm font-medium text-text-primary">{option.label}</span>
            </label>
          ))}
        </div>
        <FieldError id={accentErrorId} message={state.fieldErrors?.accentToken} />
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="profile-links" className="text-sm font-semibold text-text-primary">
          Links
        </label>
        <p id="profile-links-description" className="text-sm text-text-muted">
          Até {PROFILE_LINK_MAX_COUNT} URLs HTTPS, uma por linha. Links com usuário ou senha na URL não são aceitos.
        </p>
        <textarea
          id="profile-links"
          name="links"
          rows={5}
          inputMode="url"
          defaultValue={links.join("\n")}
          aria-describedby={[
            "profile-links-description",
            state.fieldErrors?.links ? linksErrorId : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={state.fieldErrors?.links ? true : undefined}
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted disabled:opacity-70"
          placeholder={"https://exemplo.com/\nhttps://outro-exemplo.com/"}
        />
        <FieldError id={linksErrorId} message={state.fieldErrors?.links} />
      </div>

      <fieldset
        className="grid gap-3"
        aria-describedby={state.fieldErrors?.favoriteCategories ? categoriesErrorId : undefined}
      >
        <legend className="text-sm font-semibold text-text-primary">Categorias culturais favoritas</legend>
        <p className="text-sm text-text-muted">
          Escolha até {PROFILE_CATEGORY_MAX_COUNT}. A lista usa somente a taxonomia canônica do Caleida.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus"
            >
              <input
                type="checkbox"
                name="favoriteCategories"
                value={category}
                defaultChecked={favoriteCategories.includes(category)}
                disabled={isPending}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-text-primary">
                {categoryLabels[category]}
              </span>
            </label>
          ))}
        </div>
        <FieldError id={categoriesErrorId} message={state.fieldErrors?.favoriteCategories} />
      </fieldset>

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Perfil não salvo">
          {state.message}
        </Feedback>
      ) : null}

      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Perfil atualizado">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando…" : "Salvar perfil"}
      </Button>
    </form>
  );
}

void PROFILE_ACCENT_TOKENS;
