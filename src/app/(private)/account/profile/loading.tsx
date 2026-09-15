export default function AccountProfileLoading() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-4xl gap-8" aria-busy="true" aria-live="polite">
        <div className="h-14 w-48 animate-pulse rounded-lg bg-surface-raised" />
        <section className="grid gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-raised" />
          <div className="h-14 max-w-xl animate-pulse rounded bg-surface-raised" />
          <p className="text-sm text-text-muted">Carregando seu perfil privado…</p>
        </section>
        <div className="h-72 animate-pulse rounded-[2rem] border border-border bg-surface" />
      </div>
    </main>
  );
}
