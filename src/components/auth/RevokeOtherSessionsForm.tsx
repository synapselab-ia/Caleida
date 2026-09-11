"use client";

import { useActionState } from "react";

import { revokeOtherSessionsAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

const initialState: AuthActionState = { status: "idle" };

export function RevokeOtherSessionsForm({ disabled }: { disabled: boolean }) {
  const [state, action, isPending] = useActionState(
    revokeOtherSessionsAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-3" aria-busy={isPending}>
      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Sessões não encerradas">
          {state.message}
        </Feedback>
      ) : null}
      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Sessões atualizadas">
          {state.message}
        </Feedback>
      ) : null}
      <Button type="submit" variant="secondary" disabled={disabled || isPending}>
        {isPending ? "Encerrando…" : "Encerrar todas as outras sessões"}
      </Button>
    </form>
  );
}
