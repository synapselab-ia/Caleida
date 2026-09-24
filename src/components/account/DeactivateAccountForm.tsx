"use client";

import { useActionState } from "react";

import {
  deactivateAccountAction,
  type AccountLifecycleActionState,
} from "@/lib/account/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

const initialState: AccountLifecycleActionState = { status: "idle" };

export function DeactivateAccountForm() {
  const [state, action, isPending] = useActionState(
    deactivateAccountAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4" aria-busy={isPending}>
      <div className="grid gap-2">
        <label
          htmlFor="deactivation-confirmation"
          className="text-sm font-semibold text-text-primary"
        >
          Confirmação
        </label>
        <p
          id="deactivation-confirmation-help"
          className="text-sm leading-6 text-text-muted"
        >
          Digite <strong>DESATIVAR</strong>. Seus dados serão preservados, mas o
          perfil ficará oculto e as áreas privadas normais serão bloqueadas.
        </p>
        <input
          id="deactivation-confirmation"
          name="confirmation"
          type="text"
          autoComplete="off"
          aria-describedby="deactivation-confirmation-help"
          disabled={isPending}
          required
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Conta não desativada">
          {state.message}
        </Feedback>
      ) : null}

      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Conta desativada">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Desativando…" : "Desativar conta"}
      </Button>
    </form>
  );
}
