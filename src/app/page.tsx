import { CaleidaLogo } from "@/components/brand/CaleidaLogo";

const categories = [
  { label: "Livro", marker: "bg-category-book" },
  { label: "Mangá", marker: "bg-category-manga" },
  { label: "Manhwa", marker: "bg-category-manhwa" },
  { label: "Manhua", marker: "bg-category-manhua" },
  { label: "Filme", marker: "bg-category-movie" },
  { label: "Série", marker: "bg-category-series" },
  { label: "Anime", marker: "bg-category-anime" },
] as const;

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-background text-text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <span className="absolute -right-28 top-20 size-64 rotate-12 rounded-[2.5rem] border border-brand-violet opacity-20 sm:-right-20 sm:size-80" />
        <span className="absolute -left-24 bottom-20 size-52 rotate-45 rounded-[2rem] bg-brand-magenta opacity-[0.06] sm:size-64" />
        <span className="absolute left-1/2 top-[42%] size-28 -translate-x-1/2 rotate-45 border border-brand-blue opacity-10 lg:size-36" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <header className="flex min-w-0 items-center justify-between gap-6 border-b border-border pb-5 sm:pb-6">
          <CaleidaLogo className="h-14 max-w-56 sm:h-16 sm:max-w-64" />
          <p className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted sm:block">
            Fundação visual
          </p>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,0.88fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
              Organização cultural pessoal
            </p>

            <h1 className="mt-5 max-w-3xl font-editorial text-5xl leading-[0.98] tracking-[-0.035em] text-text-primary sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Cada história muda o desenho.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
              Caleida está construindo um espaço único para preservar e compreender a
              relação de cada pessoa com livros, quadrinhos, filmes, séries e anime —
              sem transformar trajetórias culturais em uma lista indiferenciada.
            </p>

            <div className="mt-9 max-w-2xl border-l-2 border-accent pl-5 sm:pl-6">
              <p className="font-editorial text-xl leading-8 text-text-primary sm:text-2xl sm:leading-9">
                Uma fundação para repertórios diferentes continuarem pertencendo à
                mesma história.
              </p>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Esta etapa consolida identidade, temas, tipografia, responsividade e
                acessibilidade. Funcionalidades de produto entram somente nos próximos
                incrementos.
              </p>
            </div>
          </div>

          <aside className="min-w-0 rounded-[2rem] border border-border bg-surface p-5 shadow-sm sm:p-7 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Repertório
            </p>
            <h2 className="mt-3 font-editorial text-3xl leading-tight tracking-[-0.02em] text-text-primary sm:text-4xl">
              Sete linguagens, uma identidade.
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
              As categorias compartilham a mesma base visual e continuam reconhecíveis
              por nome, não apenas por cor.
            </p>

            <ul
              aria-label="Categorias culturais do Caleida"
              className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            >
              {categories.map((category) => (
                <li
                  key={category.label}
                  className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-3 py-3 text-sm font-semibold text-text-primary"
                >
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 rounded-full ${category.marker}`}
                  />
                  <span className="truncate">{category.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 border-t border-border pt-5 text-sm leading-6 text-text-muted">
              Nenhuma ação é simulada nesta página. Login, catálogo, biblioteca e demais
              fluxos só aparecerão quando forem funcionalidades reais.
            </p>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs leading-5 text-text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>Caleida · fundação visual do produto</p>
          <p>Light/dark pelo sistema · sem fluxo funcional nesta etapa</p>
        </footer>
      </div>
    </main>
  );
}
