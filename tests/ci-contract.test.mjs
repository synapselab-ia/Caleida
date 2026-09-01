import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../.github/workflows/ci.yml", import.meta.url);

test("CI reuses the canonical verification commands with PostgreSQL 18", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /image: postgres:18/);
  assert.match(workflow, /node-version-file: \.nvmrc/);
  assert.match(workflow, /run: npm ci/);
  assert.match(workflow, /run: npm run verify(?:\r?\n|$)/);
  assert.match(workflow, /run: npm run verify:db/);
});

test("CI has no deployment surface", async () => {
  const workflow = (await readFile(workflowUrl, "utf8")).toLowerCase();

  for (const forbidden of ["vercel", "deploy", "deployment", "vercel_token", "id-token: write"]) {
    assert.equal(workflow.includes(forbidden), false, `forbidden CI surface: ${forbidden}`);
  }
});
