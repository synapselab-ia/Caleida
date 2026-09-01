import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const envExampleUrl = new URL("../.env.example", import.meta.url);
const gitignoreUrl = new URL("../.gitignore", import.meta.url);
const ciUrl = new URL("../.github/workflows/ci.yml", import.meta.url);
const environmentsDocUrl = new URL("../docs/ENVIRONMENTS.md", import.meta.url);

test("versioned env contract contains no active assignments", async () => {
  const envExample = await readFile(envExampleUrl, "utf8");
  const activeLines = envExample
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  assert.deepEqual(activeLines, []);
});

test("database secrets stay server-only and public env surface is empty", async () => {
  const envExample = await readFile(envExampleUrl, "utf8");

  assert.match(envExample, /# DATABASE_URL=/);
  assert.match(envExample, /# DATABASE_URL_UNPOOLED=/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_DATABASE_URL/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_DATABASE_URL_UNPOOLED/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_(?:NEON|VERCEL|AUTH|DATABASE)_/);
  assert.match(envExample, /não possui nenhuma variável NEXT_PUBLIC_\* necessária/);
});

test("git ignores local env files and only versions the canonical example", async () => {
  const gitignore = await readFile(gitignoreUrl, "utf8");

  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});

test("environment contract separates local, non-production and Production", async () => {
  const documentation = await readFile(environmentsDocUrl, "utf8");

  assert.match(documentation, /desenvolvimento local/i);
  assert.match(documentation, /non-production \/ staging/i);
  assert.match(documentation, /Production exige projeto Neon separado/);
  assert.match(documentation, /Production é proibida para desenvolvimento local/);
  assert.match(documentation, /não se reutiliza `baseline` para chegar a Production/);
});

test("CI does not consume repository secrets or add CD", async () => {
  const workflow = (await readFile(ciUrl, "utf8")).toLowerCase();

  assert.equal(workflow.includes("${{ secrets."), false);
  assert.equal(workflow.includes("vercel_token"), false);
  assert.equal(workflow.includes("deploy"), false);
});
