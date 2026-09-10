"use server";

import { redirect } from "next/navigation";

import { createServerAuth } from "@/lib/auth/server";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
};

const LOGIN_ERROR_MESSAGE =
  "Não foi possível entrar com os dados informados. Verifique as credenciais e tente novamente.";
const LOGOUT_ERROR_MESSAGE =
  "Não foi possível encerrar a sessão agora. Tente novamente.";

function readTextEntry(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
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
