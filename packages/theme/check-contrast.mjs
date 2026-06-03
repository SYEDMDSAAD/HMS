#!/usr/bin/env node
/**
 * Contrast check for the UC Healthcare tokens.
 *
 *   node packages/theme/check-contrast.mjs
 *
 * Parses tokens.css directly, so it verifies the values the apps actually
 * compile — not a transcription of them that can drift. Run it after touching
 * any colour in tokens.css. Exits non-zero on a failure so it can be wired into
 * CI later.
 *
 * The pairs below are the ones the design system commits to. Two different
 * floors apply, and mixing them up is the usual way an "accessible palette"
 * turns out not to be:
 *
 *   4.5:1  text against its background            (WCAG 1.4.3, normal text)
 *   3.0:1  the boundary of a control, and any     (WCAG 1.4.11, non-text)
 *          graphic you have to be able to see
 *
 * A decorative hairline between two cards has no floor at all — it is not
 * conveying anything. That is why `line` is unchecked and `line-control` is.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "tokens.css"), "utf8");

/* --- parse ------------------------------------------------------------- */

// Strip comments first; a hex inside prose would otherwise be read as a value.
const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Pull `--name: value;` pairs out of the block introduced by `selector`. */
function block(selector) {
  const start = bare.indexOf(selector);
  if (start === -1) throw new Error(`block not found: ${selector}`);
  const open = bare.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < bare.length; end++) {
    if (bare[end] === "{") depth++;
    else if (bare[end] === "}" && --depth === 0) break;
  }
  const body = bare.slice(open + 1, end);
  const out = new Map();
  for (const [, k, v] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(k, v.trim());
  }
  return out;
}

const ramps = block("@theme {");
const light = new Map([...ramps, ...block(":root {")]);
const dark = new Map([...light, ...block('[data-theme="dark"] {')]);

/** Follow var() indirection until a literal colour falls out. */
function resolve(scope, name) {
  let v = name.startsWith("--") ? scope.get(name) : name;
  for (let i = 0; v && i < 10; i++) {
    const m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v.trim());
    if (!m) break;
    v = scope.get(m[1]);
  }
  if (!v) throw new Error(`unresolved token: ${name}`);
  const hex = v.trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`not a hex colour: ${name} -> ${hex}`);
  return hex;
}

/* --- WCAG 2.1 relative luminance --------------------------------------- */

function luminance(hex) {
  const ch = (i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(1) + 0.0722 * ch(2);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* --- the contract ------------------------------------------------------ */

const TEXT = 4.5;
const UI = 3.0;

// [foreground, background, floor, what it is]
const PAIRS = [
  ["--ui-fg", "--ui-canvas", TEXT, "body text on the page"],
  ["--ui-fg", "--ui-surface", TEXT, "body text on a card"],
  ["--ui-fg", "--ui-surface-muted", TEXT, "body text on a muted panel"],
  ["--ui-fg-muted", "--ui-surface", TEXT, "labels / secondary text"],
  ["--ui-fg-muted", "--ui-surface-muted", TEXT, "secondary text on a muted panel"],
  ["--ui-fg-subtle", "--ui-surface", TEXT, "captions / helper text"],
  ["--ui-fg-subtle", "--ui-surface-muted", TEXT, "helper text on a muted panel"],
  ["--ui-fg-placeholder", "--ui-surface", TEXT, "input placeholder"],
  ["--ui-fg-inverted", "--ui-surface-inverted", TEXT, "text on an inverted panel"],

  ["--ui-accent-on-solid", "--ui-accent-solid", TEXT, "button label on accent fill"],
  ["--ui-accent-on-solid", "--ui-accent-solid-hover", TEXT, "button label, hovered"],
  ["--ui-accent-text", "--ui-surface", TEXT, "accent link on a card"],
  ["--ui-accent-text", "--ui-accent-tint", TEXT, "accent text on an accent wash"],

  ["--ui-line-control", "--ui-surface", UI, "input border on a card"],
  ["--ui-line-control", "--ui-surface-muted", UI, "input border on a muted panel"],
  ["--ui-line-control", "--ui-surface-raised", UI, "input border inside a modal"],
  ["--ui-focus", "--ui-canvas", UI, "focus ring against the page"],
  ["--ui-focus", "--ui-surface", UI, "focus ring against a card"],

  // The logo mark. Not text, so 3:1 — and it is checked against the light
  // canvas in both themes because favicon.svg renders on whatever the browser
  // chrome provides, not on our background.
  ["--color-accent-600", "#ffffff", UI, "logo mark on white"],
];

// Status colours are picked per theme rather than routed through a semantic
// token, since nothing consumes them as roles yet. Part 5's StatusPill will.
const STATUS = {
  light: [
    ["--color-danger-700", "--color-danger-50", TEXT, "error text on error tint"],
    ["#ffffff", "--color-danger-600", TEXT, "text on a danger fill"],
    ["--color-danger-600", "--ui-surface", TEXT, "error text on a card"],
    ["--color-warning-900", "--color-warning-50", TEXT, "warning text on warning tint"],
    ["--color-success-700", "--color-success-50", TEXT, "success text on success tint"],
    ["--color-success-700", "--ui-surface", TEXT, "success text on a card"],
  ],
  dark: [
    ["--color-danger-300", "--ui-surface", TEXT, "error text on a card"],
    ["--color-warning-300", "--ui-surface", TEXT, "warning text on a card"],
    ["--color-success-300", "--ui-surface", TEXT, "success text on a card"],
  ],
};

/* --- run --------------------------------------------------------------- */

let failed = 0;

for (const [theme, scope] of [["light", light], ["dark", dark]]) {
  console.log(`\n  ${theme}`);
  for (const [fg, bg, floor, what] of [...PAIRS, ...STATUS[theme]]) {
    const ratio = contrast(resolve(scope, fg), resolve(scope, bg));
    const ok = ratio >= floor;
    if (!ok) failed++;
    console.log(
      `  ${ok ? "  ok" : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1  ` +
        `(min ${floor.toFixed(1)})  ${what}`
    );
  }
}

console.log(
  failed
    ? `\n  ${failed} pair(s) below their floor.\n`
    : `\n  All pairs pass.\n`
);
process.exit(failed ? 1 : 0);
