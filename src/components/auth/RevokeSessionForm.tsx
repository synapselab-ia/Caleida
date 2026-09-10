"use client";

import { useActionState } from "react";

import { revokeSessionAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

const initialState: AuthActionState = { status: "idle" };

export function RevokeSessionForm({ sessionId }: { sessionId: string }) {
  const [state, action, isPending] = useActionState(revokeSessionAction, initialState);

  return (
    <form action={action} className="grid gap-2" aria-busy={isPending}>
      <input type="hidden" name="sessionId" value={sessionId} />
      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Sessão não encerrada">
          {state.message}
        </Feedback>
      ) : null}
      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Sessão atualizada">
          {state.message}
        </Feedback>
      ) : null}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Encerrando…" : "Encerrar esta sessão"}
      </Button>
    </form>
  );
}
