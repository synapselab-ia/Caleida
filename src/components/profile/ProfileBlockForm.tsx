"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import {
  blockProfileAction,
  type BlockProfileActionState,
} from "@/lib/profile/block-actions";

const initialState: BlockProfileActionState = { status: "idle" };

export function ProfileBlockForm() {
  const [state, action, isPending] = useActionState(blockProfileAction, initialState);

  return (
    <form action={action} className="grid gap-4" aria-busy={isPending}>
      <div className="grid gap-2">
        <label htmlFor="block-username" className="text-sm font-semibold text-text-primary">
          Nome de usuário
        </label>
        <p id="block-username-description" className="text-sm leading-6 text-text-muted">
          O perfil precisa estar disponível para você no momento do bloqueio.
        </p>
        <input
          id="block-username"
          name="username"
          type="text"
          autoComplete="off"
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])"
          aria-describedby="block-username-description"
          disabled={isPending}
          required
          className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="nome_de_usuario"
        />
      </div>

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Bloqueio não aplicado">
          {state.message}
        </Feedback>
      ) : null}

      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Perfil bloqueado">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Bloqueando…" : "Bloquear perfil"}
      </Button>
    </form>
  );
}
