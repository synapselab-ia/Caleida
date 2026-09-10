"use client";

import { useActionState } from "react";

import { changePasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthActionState = { status: "idle" };

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={action} className="grid gap-5" aria-busy={isPending}>
      <FormField
        id="current-password"
        name="currentPassword"
        label="Senha atual"
        type="password"
        autoComplete="current-password"
        required
        disabled={isPending}
      />
      <FormField
        id="new-password"
        name="newPassword"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
        disabled={isPending}
      />
      <FormField
        id="new-password-confirmation"
        name="confirmPassword"
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
        disabled={isPending}
      />

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Senha não alterada">
          {state.message}
        </Feedback>
      ) : null}
      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Senha atualizada">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Alterando…" : "Alterar senha"}
      </Button>
    </form>
  );
}
