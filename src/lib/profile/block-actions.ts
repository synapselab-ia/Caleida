"use server";

import { revalidatePath } from "next/cache";

import {
  ProfileBlockDataApiError,
  createProfileBlockByUsername,
  removeOwnProfileBlock,
} from "@/lib/profile/blocks-data-api";

export type BlockProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export type UnblockProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function blockProfileAction(
  _previousState: BlockProfileActionState,
  formData: FormData,
): Promise<BlockProfileActionState> {
  void _previousState;
  const username = readText(formData.get("username")).trim().toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      status: "error",
      message: "Informe um nome de usuário válido do Caleida.",
    };
  }

  try {
    await createProfileBlockByUsername(username);
  } catch (error) {
    if (error instanceof ProfileBlockDataApiError) {
      if (error.code === "not_found") {
        return {
          status: "error",
          message:
            "Esse perfil não está disponível para você. Ele pode não existir, estar privado ou já participar de um bloqueio.",
        };
      }
      if (error.code === "self") {
        return {
          status: "error",
          message: "Você não pode bloquear o próprio perfil.",
        };
      }
      if (error.code === "conflict") {
        return {
          status: "error",
          message: "Esse perfil já está na sua lista de bloqueios.",
        };
      }
      if (error.code === "authentication") {
        return {
          status: "error",
          message: "Sua sessão não pôde ser validada. Entre novamente e tente outra vez.",
        };
      }
    }

    return {
      status: "error",
      message: "Não foi possível bloquear esse perfil agora. Tente novamente.",
    };
  }

  revalidatePath("/account/privacy");
  revalidatePath(`/${username}`);
  return {
    status: "success",
    message: `@${username} foi bloqueado. O perfil deixa de ser acessível entre as duas contas autenticadas.`,
  };
}

export async function unblockProfileAction(
  _previousState: UnblockProfileActionState,
  formData: FormData,
): Promise<UnblockProfileActionState> {
  void _previousState;
  const blockedAuthUserId = readText(formData.get("blockedAuthUserId")).trim();
  const blockedUsername = readText(formData.get("blockedUsername")).trim().toLowerCase();

  if (!UUID_PATTERN.test(blockedAuthUserId) || !USERNAME_PATTERN.test(blockedUsername)) {
    return {
      status: "error",
      message: "O bloqueio informado é inválido.",
    };
  }

  try {
    await removeOwnProfileBlock(blockedAuthUserId);
  } catch (error) {
    if (error instanceof ProfileBlockDataApiError) {
      if (error.code === "not_found") {
        return {
          status: "error",
          message: "Esse bloqueio não existe mais ou não pertence à sua conta.",
        };
      }
      if (error.code === "authentication") {
        return {
          status: "error",
          message: "Sua sessão não pôde ser validada. Entre novamente e tente outra vez.",
        };
      }
    }

    return {
      status: "error",
      message: "Não foi possível remover esse bloqueio agora. Tente novamente.",
    };
  }

  revalidatePath("/account/privacy");
  revalidatePath(`/${blockedUsername}`);
  return {
    status: "success",
    message: `@${blockedUsername} foi removido da sua lista de bloqueios.`,
  };
}
