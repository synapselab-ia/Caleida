import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const authServer = read("src/lib/auth/server.ts");
const authRoute = read("src/app/api/auth/[...path]/route.ts");
const envExample = read(".env.example");

test("Neon Auth SDK is exact-pinned and no auth UI dependency is direct", () => {
  assert.equal(packageJson.dependencies["@neondatabase/auth"], "0.5.0-beta");
  assert.equal(packageJson.dependencies["@neondatabase/auth-ui"], undefined);
});

test("server auth boundary is lazy, server-only and fail-closed", () => {
  assert.match(authServer, /import\s+["']server-only["']/);
  assert.match(authServer, /createNeonAuth/);
  assert.match(authServer, /NEON_AUTH_BASE_URL/);
  assert.match(authServer, /NEON_AUTH_COOKIE_SECRET/);
  assert.match(authServer, /MIN_COOKIE_SECRET_LENGTH\s*=\s*32/);
  assert.match(authServer, /SESSION_DATA_TTL_SECONDS\s*=\s*300/);
  assert.match(authServer, /parsedBaseUrl\.protocol\s*!==\s*["']https:["']/);
  assert.match(authServer, /AuthConfigurationError/);
  assert.match(authServer, /AuthSessionValidationError/);
  assert.doesNotMatch(authServer, /NEXT_PUBLIC_/);
});

test("route exposes only GET/POST and forwards the catch-all context required by the SDK", () => {
  assert.match(authRoute, /type\s+AuthRouteContext/);
  assert.match(authRoute, /params:\s*Promise<\{\s*path:\s*string\[\]\s*\}>/);
  assert.match(authRoute, /export\s+async\s+function\s+GET\(request:\s*NextRequest,\s*context:\s*AuthRouteContext\)/);
  assert.match(authRoute, /export\s+async\s+function\s+POST\(request:\s*NextRequest,\s*context:\s*AuthRouteContext\)/);
  assert.match(authRoute, /\.GET\(request,\s*context\)/);
  assert.match(authRoute, /\.POST\(request,\s*context\)/);
  assert.match(authRoute, /force-dynamic/);
  assert.doesNotMatch(authRoute, /signUp|signIn|logout|Data API/i);
});

test("environment contract documents Auth names without active values or public secrets", () => {
  assert.match(envExample, /^# NEON_AUTH_BASE_URL=/m);
  assert.match(envExample, /^# NEON_AUTH_COOKIE_SECRET=/m);
  assert.doesNotMatch(envExample, /^NEON_AUTH_/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_NEON_AUTH_COOKIE_SECRET/);
});

test("US-AUTH-001 does not fabricate client auth or proxy UI surface", () => {
  assert.equal(fs.existsSync(path.join(root, "src/lib/auth/client.ts")), false);
  assert.equal(fs.existsSync(path.join(root, "src/proxy.ts")), false);
  assert.equal(fs.existsSync(path.join(root, "proxy.ts")), false);
});
