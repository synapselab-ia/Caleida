"use client";

import { useActionState } from "react";

import { requestPasswordResetAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthActionState = { status: "idle" };

export function PasswordRecoveryForm() {
  const [state, action, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-5" aria-busy={isPending}>
      <FormField
        id="recovery-email"
        name="email"
        label="E-mail da conta"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        disabled={isPending}
      />

      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Solicitação recebida">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Solicitando…" : "Enviar instruções"}
      </Button>
    </form>
  );
}
