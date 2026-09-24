"use client";

import { useActionState } from "react";

import {
  reactivateAccountAction,
  type AccountLifecycleActionState,
} from "@/lib/account/actions";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";

const initialState: AccountLifecycleActionState = { status: "idle" };

export function ReactivateAccountForm() {
  const [state, action, isPending] = useActionState(
    reactivateAccountAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4" aria-busy={isPending}>
      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Conta ainda desativada">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Reativando…" : "Reativar conta"}
      </Button>
    </form>
  );
}
