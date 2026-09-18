export default function PublicProfileLoading() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div
        className="mx-auto grid w-full max-w-4xl gap-8"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-14 w-48 animate-pulse rounded-lg bg-surface-raised" />
        <div className="grid gap-4 rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
          <div className="h-14 max-w-lg animate-pulse rounded bg-surface-raised" />
          <div className="h-5 w-40 animate-pulse rounded bg-surface-raised" />
          <p className="text-sm text-text-muted">Carregando perfil…</p>
        </div>
      </div>
    </main>
  );
}
