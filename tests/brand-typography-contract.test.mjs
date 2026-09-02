import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fontsUrl = new URL("../src/app/fonts.ts", import.meta.url);
const layoutUrl = new URL("../src/app/layout.tsx", import.meta.url);
const globalsUrl = new URL("../src/app/globals.css", import.meta.url);
const logoComponentUrl = new URL(
  "../src/components/brand/CaleidaLogo.tsx",
  import.meta.url,
);
const brandReadmeUrl = new URL("../public/brand/README.md", import.meta.url);
const documentationUrl = new URL("../docs/BRAND_TYPOGRAPHY.md", import.meta.url);

test("Manrope and Newsreader are centralized through next/font", async () => {
  const fonts = await readFile(fontsUrl, "utf8");

  assert.match(fonts, /import \{ Manrope, Newsreader \} from "next\/font\/google"/);
  assert.match(fonts, /Manrope\(\{[\s\S]*subsets: \["latin"\]/);
  assert.match(fonts, /variable: "--font-caleida-interface"/);
  assert.match(fonts, /fallback: \["Arial", "sans-serif"\]/);
  assert.match(fonts, /Newsreader\(\{[\s\S]*subsets: \["latin"\]/);
  assert.match(fonts, /variable: "--font-caleida-editorial"/);
  assert.match(fonts, /fallback: \["Georgia", "serif"\]/);
  assert.match(fonts, /style: \["normal", "italic"\]/);
  assert.match(fonts, /preload: false/);
  assert.equal((fonts.match(/display: "swap"/g) ?? []).length, 2);
  assert.doesNotMatch(fonts, /fonts\.googleapis\.com|@import\s+url\(/);
});

test("root layout installs both font variables without feature UI", async () => {
  const layout = await readFile(layoutUrl, "utf8");

  assert.match(layout, /import \{ manrope, newsreader \} from "\.\/fonts"/);
  assert.match(layout, /className=\{`\$\{manrope\.variable\} \$\{newsreader\.variable\}`\}/);
});

test("semantic typography tokens expose interface and editorial roles", async () => {
  const css = await readFile(globalsUrl, "utf8");

  assert.match(css, /--font-sans:\s*var\(--font-caleida-interface\);/);
  assert.match(css, /--font-editorial:\s*var\(--font-caleida-editorial\);/);
  assert.match(
    css,
    /font-family:\s*var\(--font-caleida-interface\), Arial, sans-serif;/,
  );
});

test("horizontal brand asset uses next/image with a stable responsive box", async () => {
  const component = await readFile(logoComponentUrl, "utf8");

  assert.match(component, /import Image from "next\/image"/);
  assert.match(component, /src="\/brand\/caleida-logo-horizontal\.png"/);
  assert.match(component, /alt="Caleida"/);
  assert.match(component, /\bfill\b/);
  assert.match(component, /sizes="\(max-width: 640px\) 72vw, 20rem"/);
  assert.match(component, /relative block h-20 w-full max-w-80 shrink-0/);
  assert.match(component, /className="object-contain object-left"/);
  assert.doesNotMatch(component, /filter:|invert|hue-rotate|grayscale/);
});

test("missing brand variants remain explicit pending assets", async () => {
  const brandReadme = await readFile(brandReadmeUrl, "utf8");
  const documentation = await readFile(documentationUrl, "utf8");

  assert.match(brandReadme, /caleida-logo-horizontal\.png/);
  assert.match(brandReadme, /ainda não existem no repositório/);
  assert.match(brandReadme, /favicon/);
  assert.match(documentation, /pendências reais de ativo/);
  assert.match(documentation, /nenhum favicon é criado/);
  assert.match(documentation, /US-DS-004/);
});
