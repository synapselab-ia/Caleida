"use client";

import { useActionState } from "react";

import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthActionState = { status: "idle" };

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="grid gap-5" aria-busy={isPending}>
      <FormField
        id="login-email"
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        disabled={isPending}
      />
      <FormField
        id="login-password"
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        disabled={isPending}
      />

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Não foi possível entrar">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
