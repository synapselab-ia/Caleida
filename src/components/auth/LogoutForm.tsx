"use client";

import { useActionState } from "react";

import { logoutAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

const initialState: AuthActionState = { status: "idle" };

export function LogoutForm() {
  const [state, action, isPending] = useActionState(logoutAction, initialState);

  return (
    <form action={action} className="grid gap-3" aria-busy={isPending}>
      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Sessão ainda ativa">
          {state.message}
        </Feedback>
      ) : null}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saindo…" : "Sair"}
      </Button>
    </form>
  );
}
