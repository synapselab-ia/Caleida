"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deactivateProductAccount,
  getProductAccountLifecycle,
  reactivateProductAccount,
  sessionStartedAfterDeactivation,
} from "@/lib/account/lifecycle";
import { tryRecordAccountLifecycleEvent } from "@/lib/audit/account-lifecycle";
import { getServerSession } from "@/lib/auth/server";
import {
  revokeAllOwnedSessionsForLifecycle,
  revokeOtherOwnedSessionsForLifecycle,
} from "@/lib/auth/session-management";

export type AccountLifecycleActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const DEACTIVATION_CONFIRMATION = "DESATIVAR";

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function getAuthenticatedSessionOrRedirect() {
  const session = await getServerSession().catch(() => null);
  if (!session?.user || !session.session) redirect("/login");
  return session;
}

export async function deactivateAccountAction(
  _previousState: AccountLifecycleActionState,
  formData: FormData,
): Promise<AccountLifecycleActionState> {
  void _previousState;
  const session = await getAuthenticatedSessionOrRedirect();
  const actorAuthUserId = session.user.id;
  const confirmation = readText(formData.get("confirmation")).trim();

  if (confirmation !== DEACTIVATION_CONFIRMATION) {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_deactivated",
      actorAuthUserId,
      outcome: "denied",
      reasonCode: "confirmation_mismatch",
    });

    return {
      status: "error",
      message:
        "Digite " + DEACTIVATION_CONFIRMATION + " para confirmar a desativação.",
    };
  }

  try {
    await deactivateProductAccount(actorAuthUserId);
  } catch {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_deactivated",
      actorAuthUserId,
      outcome: "error",
      reasonCode: "database_error",
    });

    return {
      status: "error",
      message: "Não foi possível desativar sua conta agora. Nenhum dado foi apagado.",
    };
  }

  const revocation = await revokeAllOwnedSessionsForLifecycle(
    actorAuthUserId,
    session.session.id,
  );

  const complete =
    revocation.remoteSessionsRevoked && revocation.currentSessionRevoked;

  await tryRecordAccountLifecycleEvent({
    eventType: "account_deactivated",
    actorAuthUserId,
    outcome: "success",
    reasonCode: complete ? "completed" : "session_revocation_partial",
  });

  revalidatePath("/app");
  revalidatePath("/account/profile");
  revalidatePath("/account/privacy");
  revalidatePath("/account/security");
  revalidatePath("/account/lifecycle");

  if (revocation.currentSessionRevoked) {
    redirect("/login?deactivated=1");
  }

  return {
    status: "success",
    message:
      "A conta foi desativada e seus dados foram preservados. A sessão atual não pôde ser encerrada pelo provedor, mas o acesso normal já está bloqueado. Saia e entre novamente para reativar.",
  };
}

export async function reactivateAccountAction(
  _previousState: AccountLifecycleActionState,
): Promise<AccountLifecycleActionState> {
  void _previousState;
  const session = await getAuthenticatedSessionOrRedirect();
  const actorAuthUserId = session.user.id;

  let lifecycle;
  try {
    lifecycle = await getProductAccountLifecycle(actorAuthUserId);
  } catch {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_reactivated",
      actorAuthUserId,
      outcome: "error",
      reasonCode: "database_error",
    });

    return {
      status: "error",
      message: "Não foi possível validar o estado da conta agora.",
    };
  }

  if (lifecycle.status !== "deactivated") {
    redirect("/app");
  }

  if (
    !sessionStartedAfterDeactivation(
      session.session.createdAt,
      lifecycle.deactivatedAt,
    )
  ) {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_reactivated",
      actorAuthUserId,
      outcome: "denied",
      reasonCode: "stale_session",
    });

    return {
      status: "error",
      message:
        "Para reativar, encerre esta sessão e faça um novo login depois da desativação.",
    };
  }

  const remoteSessionsRevoked = await revokeOtherOwnedSessionsForLifecycle(
    actorAuthUserId,
    session.session.id,
  );

  if (!remoteSessionsRevoked) {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_reactivated",
      actorAuthUserId,
      outcome: "denied",
      reasonCode: "session_revocation_failed",
    });

    return {
      status: "error",
      message:
        "Não foi possível encerrar os outros acessos com segurança. A conta continua desativada.",
    };
  }

  try {
    await reactivateProductAccount(actorAuthUserId);
  } catch {
    await tryRecordAccountLifecycleEvent({
      eventType: "account_reactivated",
      actorAuthUserId,
      outcome: "error",
      reasonCode: "database_error",
    });

    return {
      status: "error",
      message: "Não foi possível reativar sua conta agora.",
    };
  }

  await tryRecordAccountLifecycleEvent({
    eventType: "account_reactivated",
    actorAuthUserId,
    outcome: "success",
    reasonCode: "completed",
  });

  revalidatePath("/app");
  revalidatePath("/account/profile");
  revalidatePath("/account/privacy");
  revalidatePath("/account/security");
  revalidatePath("/account/lifecycle");
  redirect("/app?reactivated=1");
}
