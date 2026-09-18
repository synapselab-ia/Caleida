"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import {
  type UnblockProfileActionState,
  unblockProfileAction,
} from "@/lib/profile/block-actions";

const initialState: UnblockProfileActionState = { status: "idle" };

export function ProfileUnblockForm({
  blockedAuthUserId,
  blockedUsername,
}: {
  blockedAuthUserId: string;
  blockedUsername: string;
}) {
  const [state, action, isPending] = useActionState(unblockProfileAction, initialState);

  return (
    <form action={action} className="grid gap-2" aria-busy={isPending}>
      <input type="hidden" name="blockedAuthUserId" value={blockedAuthUserId} />
      <input type="hidden" name="blockedUsername" value={blockedUsername} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Removendo…" : "Desbloquear"}
      </Button>
      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Bloqueio mantido">
          {state.message}
        </Feedback>
      ) : null}
      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Bloqueio removido">
          {state.message}
        </Feedback>
      ) : null}
    </form>
  );
}
