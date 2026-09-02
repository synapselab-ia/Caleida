import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const buttonUrl = new URL("../src/components/ui/Button.tsx", import.meta.url);
const formFieldUrl = new URL("../src/components/ui/FormField.tsx", import.meta.url);
const feedbackUrl = new URL("../src/components/ui/Feedback.tsx", import.meta.url);
const documentationUrl = new URL("../docs/UI_PRIMITIVES.md", import.meta.url);

async function readSources() {
  const [button, formField, feedback, documentation] = await Promise.all([
    readFile(buttonUrl, "utf8"),
    readFile(formFieldUrl, "utf8"),
    readFile(feedbackUrl, "utf8"),
    readFile(documentationUrl, "utf8"),
  ]);

  return { button, formField, feedback, documentation };
}

test("button preserves native semantics and visible keyboard focus", async () => {
  const { button } = await readSources();

  assert.match(button, /ButtonHTMLAttributes<HTMLButtonElement>/);
  assert.match(button, /type = "button"/);
  assert.match(button, /return <button type=\{type\}/);
  assert.doesNotMatch(button, /role=["']button["']/);
  assert.doesNotMatch(button, /tabIndex/);

  assert.match(button, /min-h-11/);
  assert.match(button, /min-w-11/);
  assert.match(button, /focus-visible:outline-2/);
  assert.match(button, /focus-visible:outline-offset-2/);
  assert.match(button, /focus-visible:outline-focus/);
  assert.match(button, /disabled:cursor-not-allowed/);
  assert.match(button, /disabled:opacity-60/);
  assert.match(button, /enabled:hover:brightness-95/);
  assert.match(button, /enabled:hover:bg-surface-raised/);
});

test("form field explicitly associates label, description and error", async () => {
  const { formField } = await readSources();

  assert.match(formField, /InputHTMLAttributes<HTMLInputElement>/);
  assert.match(formField, /id: string/);
  assert.match(formField, /label: string/);
  assert.match(formField, /description\?: string/);
  assert.match(formField, /error\?: string/);

  assert.match(formField, /<label htmlFor=\{id\}/);
  assert.match(formField, /const descriptionId = `\$\{id\}-description`/);
  assert.match(formField, /const errorId = `\$\{id\}-error`/);
  assert.match(formField, /aria-describedby=\{describedBy\}/);
  assert.match(formField, /aria-invalid=\{error \? true : undefined\}/);
  assert.match(formField, /required=\{required\}/);
  assert.match(formField, /\(obrigatório\)/);
  assert.match(formField, /<span className="font-semibold">Erro:<\/span>/);

  assert.match(formField, /focus-visible:outline-2/);
  assert.match(formField, /focus-visible:outline-offset-2/);
  assert.match(formField, /focus-visible:outline-focus/);
  assert.match(formField, /disabled:bg-surface-raised/);
  assert.match(formField, /error \? "border-accent" : "border-border"/);
  assert.doesNotMatch(formField, /role=["']alert["']/);
});

test("feedback uses live-region roles only when urgency requires them", async () => {
  const { feedback } = await readSources();

  assert.match(feedback, /type FeedbackKind = "note" \| "status" \| "alert"/);
  assert.match(feedback, /note: undefined/);
  assert.match(feedback, /status: "status"/);
  assert.match(feedback, /alert: "alert"/);
  assert.match(feedback, /role=\{role\}/);
  assert.match(feedback, /aria-atomic=\{role \? true : undefined\}/);

  assert.doesNotMatch(feedback, /aria-live=/);
  assert.doesNotMatch(feedback, /role=["']status["']/);
  assert.doesNotMatch(feedback, /role=["']alert["']/);
});

test("primitives use canonical tokens and do not introduce component-library imports", async () => {
  const { button, formField, feedback } = await readSources();
  const combined = `${button}\n${formField}\n${feedback}`;

  for (const tokenUtility of [
    "bg-accent",
    "bg-surface",
    "bg-surface-raised",
    "border-border",
    "text-background",
    "text-text-primary",
    "text-text-muted",
    "outline-focus",
  ]) {
    assert.match(combined, new RegExp(tokenUtility));
  }

  assert.doesNotMatch(combined, /@radix-ui/);
  assert.doesNotMatch(combined, /@headlessui/);
  assert.doesNotMatch(combined, /react-aria/);
  assert.doesNotMatch(combined, /class-variance-authority/);
  assert.doesNotMatch(combined, /clsx/);
});

test("documentation keeps US-DS-003 bounded and color-independent", async () => {
  const { documentation } = await readSources();

  assert.match(documentation, /cor nunca é a única pista de erro ou significado/);
  assert.match(documentation, /não usa `role="alert"` automaticamente/);
  assert.match(documentation, /`role="status"`/);
  assert.match(documentation, /`role="alert"`/);
  assert.match(documentation, /não:\n\n- aplica os primitivos à página base/);
  assert.match(documentation, /não.*toca banco, Neon, Auth, RLS, Storage ou deployment Vercel/s);
});
