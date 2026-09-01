import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("canonical verification command preserves the required gate order", async () => {
  const pkg = await readJson(new URL("../package.json", import.meta.url));

  assert.equal(
    pkg.scripts?.verify,
    "npm run db:migrations:check && npm run lint && npm run typecheck && npm test && npm run build",
  );
});

test("database integration verification remains explicit and separate", async () => {
  const pkg = await readJson(new URL("../package.json", import.meta.url));

  assert.equal(pkg.scripts?.["verify:db"], "npm run db:migrate && npm run db:test");
});
