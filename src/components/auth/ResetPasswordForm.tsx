"use client";

import { useActionState } from "react";

import { resetPasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthActionState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="grid gap-5" aria-busy={isPending}>
      <input type="hidden" name="token" value={token} />
      <FormField
        id="reset-password"
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
        id="reset-password-confirmation"
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
        <Feedback kind="alert" title="Não foi possível redefinir">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Redefinindo…" : "Redefinir senha"}
      </Button>
    </form>
  );
}
