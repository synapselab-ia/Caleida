"use server";

import { revalidatePath } from "next/cache";

import { ProfileDataApiError, saveOwnProfile } from "@/lib/profile/data-api";
import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_CATEGORY_MAX_COUNT,
  PROFILE_LINK_MAX_COUNT,
  PROFILE_LINK_MAX_LENGTH,
  isProfileAccentToken,
  isProfileCategory,
} from "@/lib/profile/personalization";

export type ProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: {
    username?: string;
    displayName?: string;
    biography?: string;
    accentToken?: string;
    links?: string;
    favoriteCategories?: string;
  };
};

const RESERVED_USERNAMES = new Set([
  "account",
  "admin",
  "api",
  "app",
  "auth",
  "help",
  "login",
  "logout",
  "moderator",
  "profile",
  "register",
  "security",
  "settings",
  "signup",
  "support",
]);

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])$/;

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function normalizeLinks(rawValue: string) {
  const rawLinks = rawValue
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (rawLinks.length > PROFILE_LINK_MAX_COUNT) {
    return {
      error: `Adicione no máximo ${PROFILE_LINK_MAX_COUNT} links.`,
      links: [] as string[],
    };
  }

  const normalizedLinks: string[] = [];
  for (const rawLink of rawLinks) {
    if (/\s/.test(rawLink)) {
      return {
        error: "Cada link deve ser uma URL HTTPS sem espaços.",
        links: [] as string[],
      };
    }

    let parsed: URL;
    try {
      parsed = new URL(rawLink);
    } catch {
      return {
        error: "Use URLs HTTPS válidas, uma por linha.",
        links: [] as string[],
      };
    }

    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      !parsed.hostname
    ) {
      return {
        error: "Somente links HTTPS sem usuário ou senha na URL são permitidos.",
        links: [] as string[],
      };
    }

    const normalized = parsed.toString();
    if (normalized.length > PROFILE_LINK_MAX_LENGTH) {
      return {
        error: `Cada link pode ter no máximo ${PROFILE_LINK_MAX_LENGTH} caracteres.`,
        links: [] as string[],
      };
    }

    normalizedLinks.push(normalized);
  }

  if (new Set(normalizedLinks).size !== normalizedLinks.length) {
    return {
      error: "Remova links duplicados.",
      links: [] as string[],
    };
  }

  return { links: normalizedLinks };
}

function validateProfileInput(formData: FormData) {
  const username = readText(formData.get("username")).trim().toLowerCase();
  const displayName = readText(formData.get("displayName")).trim();
  const biography = readText(formData.get("biography")).trim();
  const accentToken = readText(formData.get("accentToken"));
  const linksResult = normalizeLinks(readText(formData.get("links")));
  const favoriteCategories = formData
    .getAll("favoriteCategories")
    .filter((value): value is string => typeof value === "string");

  const fieldErrors: ProfileActionState["fieldErrors"] = {};

  if (!USERNAME_PATTERN.test(username)) {
    fieldErrors.username =
      "Use de 3 a 30 caracteres com letras minúsculas, números ou sublinhado, sem sublinhado nas pontas.";
  } else if (RESERVED_USERNAMES.has(username)) {
    fieldErrors.username = "Esse nome de usuário é reservado pelo Caleida.";
  }

  if (displayName.length < 1 || displayName.length > 80) {
    fieldErrors.displayName = "Use um nome de exibição com 1 a 80 caracteres.";
  }

  if (biography.length > PROFILE_BIO_MAX_LENGTH) {
    fieldErrors.biography = `A biografia pode ter no máximo ${PROFILE_BIO_MAX_LENGTH} caracteres.`;
  }

  if (!isProfileAccentToken(accentToken)) {
    fieldErrors.accentToken = "Escolha uma cor de destaque disponível.";
  }

  if (linksResult.error) {
    fieldErrors.links = linksResult.error;
  }

  if (
    favoriteCategories.length > PROFILE_CATEGORY_MAX_COUNT ||
    new Set(favoriteCategories).size !== favoriteCategories.length ||
    !favoriteCategories.every(isProfileCategory)
  ) {
    fieldErrors.favoriteCategories =
      `Escolha até ${PROFILE_CATEGORY_MAX_COUNT} categorias culturais diferentes.`;
  }

  if (Object.keys(fieldErrors).length > 0 || linksResult.error) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    input: {
      username,
      displayName,
      biography,
      accentToken,
      links: linksResult.links,
      favoriteCategories,
    },
  };
}

export async function saveProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  void _previousState;
  const validation = validateProfileInput(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Revise os campos indicados e tente novamente.",
      fieldErrors: validation.fieldErrors,
    };
  }

  try {
    await saveOwnProfile(validation.input);
  } catch (error) {
    if (error instanceof ProfileDataApiError && error.code === "conflict") {
      return {
        status: "error",
        message: "Esse nome de usuário já está em uso.",
        fieldErrors: { username: "Escolha outro nome de usuário." },
      };
    }

    if (error instanceof ProfileDataApiError && error.code === "authentication") {
      return {
        status: "error",
        message: "Sua sessão não pôde ser validada. Entre novamente e tente outra vez.",
      };
    }

    return {
      status: "error",
      message: "Não foi possível salvar seu perfil agora. Tente novamente.",
    };
  }

  revalidatePath("/account/profile");
  return {
    status: "success",
    message: "Perfil salvo. Essas informações continuam privadas para outras pessoas.",
  };
}
