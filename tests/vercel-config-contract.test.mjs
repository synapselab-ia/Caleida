import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configUrl = new URL("../vercel.json", import.meta.url);

test("Vercel configuration disables all Git-triggered deployments", async () => {
  const config = JSON.parse(await readFile(configUrl, "utf8"));

  assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
  assert.equal(config.git?.deploymentEnabled, false);
});

test("Vercel configuration does not use the legacy GitHub deployment switch", async () => {
  const config = JSON.parse(await readFile(configUrl, "utf8"));

  assert.equal(Object.hasOwn(config, "github"), false);
});
