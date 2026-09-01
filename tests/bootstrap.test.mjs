import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("bootstrap exposes the required technical gates", async () => {
  const pkg = await readJson(new URL("../package.json", import.meta.url));

  for (const script of ["dev", "lint", "typecheck", "test", "build"]) {
    assert.equal(typeof pkg.scripts?.[script], "string", `missing script: ${script}`);
  }

  assert.equal(pkg.dependencies?.next, "16.3.3");
  assert.equal(pkg.dependencies?.react, "19.2.8");
  assert.equal(pkg.dependencies?.["react-dom"], "19.2.8");
});

test("TypeScript remains strict and the app uses src/App Router", async () => {
  const tsconfig = await readJson(new URL("../tsconfig.json", import.meta.url));
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

  assert.equal(tsconfig.compilerOptions?.strict, true);
  assert.equal(tsconfig.compilerOptions?.paths?.["@/*"]?.[0], "./src/*");
  assert.match(page, /export default function Home/);
});
