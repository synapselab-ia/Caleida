import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const globalsUrl = new URL("../src/app/globals.css", import.meta.url);
const documentationUrl = new URL("../docs/DESIGN_TOKENS.md", import.meta.url);

function parseVariables(block) {
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

function extractTheme(css) {
  const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\}/);
  const lightMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  const darkMatch = css.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\}/,
  );

  assert.ok(themeMatch, "missing @theme block");
  assert.ok(lightMatch, "missing light :root block");
  assert.ok(darkMatch, "missing prefers-color-scheme dark block");

  const primitives = parseVariables(themeMatch[1]);
  const light = { ...primitives, ...parseVariables(lightMatch[1]) };
  const dark = { ...light, ...parseVariables(darkMatch[1]) };

  return { primitives, light, dark };
}

function resolveHex(variables, token, visited = new Set()) {
  assert.ok(!visited.has(token), `cyclic token reference: ${token}`);
  visited.add(token);

  const value = variables[token];
  assert.ok(value, `missing token: ${token}`);

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toUpperCase();
  }

  const reference = value.match(/^var\((--[\w-]+)\)$/);
  assert.ok(reference, `token ${token} does not resolve to a hex color: ${value}`);
  return resolveHex(variables, reference[1], visited);
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

test("canonical brand palette is exposed through Tailwind theme tokens", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const { primitives } = extractTheme(css);

  assert.equal(primitives["--color-brand-violet"], "#7457e8");
  assert.equal(primitives["--color-brand-magenta"], "#d85ba8");
  assert.equal(primitives["--color-brand-blue"], "#4c8dff");
  assert.equal(primitives["--color-brand-green"], "#39b99a");
  assert.equal(primitives["--color-brand-amber"], "#f2a93b");
});

test("semantic color contract is mapped through @theme inline", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const requiredMappings = [
    ["background", "--caleida-background"],
    ["surface", "--caleida-surface"],
    ["surface-raised", "--caleida-surface-raised"],
    ["border", "--caleida-border"],
    ["text-primary", "--caleida-text-primary"],
    ["text-muted", "--caleida-text-muted"],
    ["accent", "--caleida-accent"],
    ["focus", "--caleida-focus"],
  ];

  assert.match(css, /@theme\s+inline\s*\{/);

  for (const [name, source] of requiredMappings) {
    assert.match(
      css,
      new RegExp(`--color-${name}:\\s*var\\(${source}\\);`),
      `missing semantic mapping for ${name}`,
    );
  }
});

test("themes follow the operating-system preference without JavaScript", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const { light, dark } = extractTheme(css);

  assert.match(css, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.equal(light["--caleida-background"], "#f7f6fa");
  assert.equal(light["--caleida-surface"], "#ffffff");
  assert.equal(light["--caleida-border"], "#e4e1ea");
  assert.equal(light["--caleida-text-primary"], "#24212a");
  assert.equal(dark["--caleida-background"], "#101014");
  assert.equal(dark["--caleida-surface"], "#17171d");
  assert.equal(dark["--caleida-surface-raised"], "#202028");
  assert.equal(dark["--caleida-border"], "#30303a");
  assert.equal(dark["--caleida-text-primary"], "#f5f4f8");
});

test("normal text semantics meet WCAG AA contrast on supported surfaces", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const { light, dark } = extractTheme(css);
  const surfaces = [
    "--caleida-background",
    "--caleida-surface",
    "--caleida-surface-raised",
  ];
  const textTokens = [
    "--caleida-text-primary",
    "--caleida-text-muted",
    "--caleida-accent",
  ];

  for (const [themeName, variables] of [
    ["light", light],
    ["dark", dark],
  ]) {
    for (const textToken of textTokens) {
      for (const surfaceToken of surfaces) {
        const ratio = contrastRatio(
          resolveHex(variables, textToken),
          resolveHex(variables, surfaceToken),
        );

        assert.ok(
          ratio >= 4.5,
          `${themeName} ${textToken} on ${surfaceToken} contrast ${ratio.toFixed(2)} is below 4.5:1`,
        );
      }
    }
  }
});

test("focus token maintains non-text contrast against normal surfaces", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const { light, dark } = extractTheme(css);

  for (const [themeName, variables] of [
    ["light", light],
    ["dark", dark],
  ]) {
    for (const surfaceToken of [
      "--caleida-background",
      "--caleida-surface",
      "--caleida-surface-raised",
    ]) {
      const ratio = contrastRatio(
        resolveHex(variables, "--caleida-focus"),
        resolveHex(variables, surfaceToken),
      );

      assert.ok(
        ratio >= 3,
        `${themeName} focus on ${surfaceToken} contrast ${ratio.toFixed(2)} is below 3:1`,
      );
    }
  }
});

test("all cultural categories have stable tokens and undocumented colors are recorded", async () => {
  const css = await readFile(globalsUrl, "utf8");
  const documentation = await readFile(documentationUrl, "utf8");
  const categories = ["book", "manga", "manhwa", "manhua", "movie", "series", "anime"];

  for (const category of categories) {
    assert.match(css, new RegExp(`--color-category-${category}:`));
  }

  assert.match(documentation, /Manhua[^\n]*`#D9685B`/);
  assert.match(documentation, /Série[^\n]*`#278EAF`/);
  assert.match(documentation, /Anime[^\n]*`#278F83`/);
  assert.match(documentation, /Nunca podem ser o único identificador da categoria/);
});
