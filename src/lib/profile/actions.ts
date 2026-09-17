"use server";

import { revalidatePath } from "next/cache";

import { ProfileDataApiError, saveOwnProfile } from "@/lib/profile/data-api";

export type ProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: {
    username?: string;
    displayName?: string;
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

function validateProfileInput(formData: FormData) {
  const username = readText(formData.get("username")).trim().toLowerCase();
  const displayName = readText(formData.get("displayName")).trim();
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

  if (fieldErrors.username || fieldErrors.displayName) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    input: { username, displayName },
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
    message: "Perfil salvo. A visibilidade continua privada para outras pessoas.",
  };
}
