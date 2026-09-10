"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createServerAuth, getServerSession } from "@/lib/auth/server";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const LOGIN_ERROR_MESSAGE =
  "Não foi possível entrar com os dados informados. Verifique as credenciais e tente novamente.";
const LOGOUT_ERROR_MESSAGE =
  "Não foi possível encerrar a sessão agora. Tente novamente.";
const RESET_REQUEST_MESSAGE =
  "Se existir uma conta para esse e-mail, você receberá instruções para redefinir a senha.";
const RESET_ERROR_MESSAGE =
  "Não foi possível redefinir a senha. O link pode estar inválido ou expirado.";
const CHANGE_PASSWORD_ERROR_MESSAGE =
  "Não foi possível alterar a senha. Confira a senha atual e tente novamente.";
const SESSION_ACTION_ERROR_MESSAGE =
  "Não foi possível atualizar suas sessões agora. Tente novamente.";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function readTextEntry(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function validPasswordLength(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

function plausibleEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getTrustedRequestOrigin() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host")?.trim();
  const rawOrigin = requestHeaders.get("origin") || requestHeaders.get("referer");

  if (!host || !rawOrigin) return null;

  let origin: URL;
  try {
    origin = new URL(rawOrigin);
  } catch {
    return null;
  }

  if (origin.host.toLowerCase() !== host.toLowerCase()) return null;

  const localHttp =
    origin.protocol === "http:" &&
    (origin.hostname === "localhost" || origin.hostname === "127.0.0.1");

  if (origin.protocol !== "https:" && !localHttp) return null;

  return origin.origin;
}

async function getAuthenticatedSessionOrRedirect() {
  const session = await getServerSession().catch(() => null);
  if (!session?.user || !session.session) redirect("/login");
  return session;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const email = readTextEntry(formData.get("email")).trim().toLowerCase();
  const password = readTextEntry(formData.get("password"));

  if (!email || !password) {
    return { status: "error", message: LOGIN_ERROR_MESSAGE };
  }

  try {
    const { error } = await createServerAuth().signIn.email({ email, password });
    if (error) {
      return { status: "error", message: LOGIN_ERROR_MESSAGE };
    }
  } catch {
    return { status: "error", message: LOGIN_ERROR_MESSAGE };
  }

  redirect("/app");
}

export async function logoutAction(
  _previousState: AuthActionState,
): Promise<AuthActionState> {
  void _previousState;

  try {
    const { error } = await createServerAuth().signOut();
    if (error) {
      return { status: "error", message: LOGOUT_ERROR_MESSAGE };
    }
  } catch {
    return { status: "error", message: LOGOUT_ERROR_MESSAGE };
  }

  redirect("/login?loggedOut=1");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const email = readTextEntry(formData.get("email")).trim().toLowerCase();
  const origin = await getTrustedRequestOrigin();

  if (plausibleEmail(email) && origin) {
    try {
      await createServerAuth().requestPasswordReset({
        email,
        redirectTo: new URL("/reset-password", origin).toString(),
      });
    } catch {
      // Intentionally indistinguishable from a successful request to prevent account enumeration.
    }
  }

  return { status: "success", message: RESET_REQUEST_MESSAGE };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const token = readTextEntry(formData.get("token"));
  const newPassword = readTextEntry(formData.get("newPassword"));
  const confirmPassword = readTextEntry(formData.get("confirmPassword"));

  if (!validPasswordLength(newPassword)) {
    return {
      status: "error",
      message: `A nova senha deve ter entre ${MIN_PASSWORD_LENGTH} e ${MAX_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "As senhas informadas não coincidem." };
  }

  if (!token) {
    return { status: "error", message: RESET_ERROR_MESSAGE };
  }

  try {
    const { error } = await createServerAuth().resetPassword({
      newPassword,
      token,
    });
    if (error) {
      return { status: "error", message: RESET_ERROR_MESSAGE };
    }
  } catch {
    return { status: "error", message: RESET_ERROR_MESSAGE };
  }

  redirect("/login?reset=1");
}

export async function changePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;
  await getAuthenticatedSessionOrRedirect();

  const currentPassword = readTextEntry(formData.get("currentPassword"));
  const newPassword = readTextEntry(formData.get("newPassword"));
  const confirmPassword = readTextEntry(formData.get("confirmPassword"));

  if (!currentPassword) {
    return { status: "error", message: CHANGE_PASSWORD_ERROR_MESSAGE };
  }

  if (!validPasswordLength(newPassword)) {
    return {
      status: "error",
      message: `A nova senha deve ter entre ${MIN_PASSWORD_LENGTH} e ${MAX_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "As senhas informadas não coincidem." };
  }

  try {
    const { error } = await createServerAuth().changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      return { status: "error", message: CHANGE_PASSWORD_ERROR_MESSAGE };
    }
  } catch {
    return { status: "error", message: CHANGE_PASSWORD_ERROR_MESSAGE };
  }

  revalidatePath("/account/security");
  return {
    status: "success",
    message: "Senha alterada. As outras sessões foram encerradas.",
  };
}

export async function revokeSessionAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const current = await getAuthenticatedSessionOrRedirect();
  const sessionId = readTextEntry(formData.get("sessionId"));

  if (!sessionId) {
    return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
  }

  let revokedCurrentSession = false;

  try {
    const auth = createServerAuth();
    const { data: sessions, error: listError } = await auth.listSessions();
    if (listError || !sessions) {
      return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
    }

    const target = sessions.find(
      (session) => session.id === sessionId && session.userId === current.user.id,
    );

    if (!target) {
      return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
    }

    if (target.id === current.session.id) {
      const { error } = await auth.signOut();
      if (error) {
        return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
      }
      revokedCurrentSession = true;
    } else {
      const { error } = await auth.revokeSession({ token: target.token });
      if (error) {
        return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
      }
    }
  } catch {
    return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
  }

  if (revokedCurrentSession) redirect("/login?loggedOut=1");

  revalidatePath("/account/security");
  return { status: "success", message: "Sessão encerrada." };
}

export async function revokeOtherSessionsAction(
  _previousState: AuthActionState,
): Promise<AuthActionState> {
  void _previousState;
  await getAuthenticatedSessionOrRedirect();

  try {
    const { error } = await createServerAuth().revokeOtherSessions();
    if (error) {
      return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
    }
  } catch {
    return { status: "error", message: SESSION_ACTION_ERROR_MESSAGE };
  }

  revalidatePath("/account/security");
  return { status: "success", message: "As outras sessões foram encerradas." };
}
