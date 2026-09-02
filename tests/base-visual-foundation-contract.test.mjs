import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../src/app/page.tsx", import.meta.url);
const logoUrl = new URL("../src/components/brand/CaleidaLogo.tsx", import.meta.url);
const globalsUrl = new URL("../src/app/globals.css", import.meta.url);

async function readSources() {
  const [page, logo, globals] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(logoUrl, "utf8"),
    readFile(globalsUrl, "utf8"),
  ]);

  return { page, logo, globals };
}

test("base page composes the approved identity with semantic structure", async () => {
  const { page } = await readSources();

  assert.match(page, /import \{ CaleidaLogo \}/);
  assert.match(page, /<main /);
  assert.match(page, /<header /);
  assert.match(page, /<section /);
  assert.match(page, /<aside /);
  assert.match(page, /<footer /);
  assert.match(page, /<h1 /);
  assert.match(page, /<h2 /);
  assert.match(page, /Cada história muda o desenho\./);
  assert.match(page, /font-editorial/);
  assert.match(page, /bg-background/);
  assert.match(page, /bg-surface/);
  assert.match(page, /border-border/);
  assert.match(page, /text-text-primary/);
  assert.match(page, /text-text-muted/);
  assert.match(page, /text-accent/);
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}/);
});

test("composition is mobile-first and protects horizontal overflow", async () => {
  const { page } = await readSources();

  assert.match(page, /min-h-dvh/);
  assert.match(page, /overflow-x-hidden/);
  assert.match(page, /px-5/);
  assert.match(page, /sm:px-8/);
  assert.match(page, /lg:px-12/);
  assert.match(page, /md:py-16/);
  assert.match(page, /lg:grid-cols-/);
  assert.match(page, /sm:grid-cols-3/);
  assert.match(page, /xl:grid-cols-3/);
  assert.match(page, /min-w-0/);

  assert.doesNotMatch(page, /hover:/);
  assert.doesNotMatch(page, /animate-/);
  assert.doesNotMatch(page, /transition-/);
});

test("all cultural categories keep visible text in addition to color", async () => {
  const { page } = await readSources();

  const categories = [
    ["Livro", "bg-category-book"],
    ["Mangá", "bg-category-manga"],
    ["Manhwa", "bg-category-manhwa"],
    ["Manhua", "bg-category-manhua"],
    ["Filme", "bg-category-movie"],
    ["Série", "bg-category-series"],
    ["Anime", "bg-category-anime"],
  ];

  for (const [label, token] of categories) {
    assert.match(page, new RegExp(`label: "${label}"`));
    assert.match(page, new RegExp(`marker: "${token}"`));
  }

  assert.match(page, /aria-label="Categorias culturais do Caleida"/);
  assert.match(page, /\{category\.label\}/);
  assert.match(page, /aria-hidden="true"/);
});

test("technical base does not fabricate interactions or future flows", async () => {
  const { page } = await readSources();

  assert.doesNotMatch(page, /<button\b/);
  assert.doesNotMatch(page, /<form\b/);
  assert.doesNotMatch(page, /<input\b/);
  assert.doesNotMatch(page, /<a\b/);
  assert.doesNotMatch(page, /href=/);
  assert.doesNotMatch(page, /components\/ui\/Button/);
  assert.doesNotMatch(page, /components\/ui\/FormField/);
  assert.doesNotMatch(page, /components\/ui\/Feedback/);

  assert.match(page, /Nenhuma ação é simulada nesta página/);
  assert.match(page, /sem fluxo funcional nesta etapa/);
});

test("official logo has a real responsive layout box", async () => {
  const { logo } = await readSources();

  assert.match(logo, /relative block h-20 w-full max-w-80 shrink-0/);
  assert.match(logo, /src="\/brand\/caleida-logo-horizontal\.png"/);
  assert.match(logo, /alt="Caleida"/);
  assert.match(logo, /className="object-contain object-left"/);
  assert.doesNotMatch(logo, /filter:/);
  assert.doesNotMatch(logo, /grayscale/);
});

test("system light and dark theme contract remains unchanged", async () => {
  const { globals } = await readSources();

  assert.match(globals, /:root \{\n  color-scheme: light;/);
  assert.match(globals, /@media \(prefers-color-scheme: dark\)/);
  assert.match(globals, /color-scheme: dark;/);
  assert.doesNotMatch(globals, /localStorage/);
  assert.doesNotMatch(globals, /data-theme/);
});
