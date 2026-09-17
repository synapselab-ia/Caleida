"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { FormField } from "@/components/ui/FormField";
import { saveProfileAction, type ProfileActionState } from "@/lib/profile/actions";

const initialState: ProfileActionState = { status: "idle" };

export function ProfileForm({
  username,
  displayName,
}: {
  username?: string;
  displayName?: string;
}) {
  const [state, action, isPending] = useActionState(saveProfileAction, initialState);

  return (
    <form action={action} className="grid gap-5" aria-busy={isPending}>
      <FormField
        id="profile-username"
        name="username"
        label="Nome de usuário"
        description="De 3 a 30 caracteres. Use letras minúsculas, números ou sublinhado."
        type="text"
        autoComplete="username"
        minLength={3}
        maxLength={30}
        pattern="[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])"
        defaultValue={username}
        error={state.fieldErrors?.username}
        required
        disabled={isPending}
      />

      <FormField
        id="profile-display-name"
        name="displayName"
        label="Nome de exibição"
        description="É o nome que o Caleida usará para representar você dentro do produto."
        type="text"
        autoComplete="name"
        minLength={1}
        maxLength={80}
        defaultValue={displayName}
        error={state.fieldErrors?.displayName}
        required
        disabled={isPending}
      />

      {state.status === "error" && state.message ? (
        <Feedback kind="alert" title="Perfil não salvo">
          {state.message}
        </Feedback>
      ) : null}

      {state.status === "success" && state.message ? (
        <Feedback kind="status" title="Perfil atualizado">
          {state.message}
        </Feedback>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando…" : "Salvar perfil"}
      </Button>
    </form>
  );
}
