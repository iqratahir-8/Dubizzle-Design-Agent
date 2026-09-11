import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * The monorepo's .css variable files are PostCSS-style: `$name: value;` declarations
 * plus `@import 'package/path.css'` lines that resolve against package roots rather
 * than the filesystem. Later declarations win, and an import's declarations count as
 * "earlier" than anything in the importing file — that's what lets dubizzle-eg
 * override dubizzle-facelift override horizontal override strat.
 */

const IMPORT_RE = /@import\s+['"]([^'"]+)['"]\s*;/g;
const DECL_RE = /\$([A-Za-z0-9_-]+)\s*:\s*([\s\S]*?);(?=\s*(?:\/\*|\$|@|$|\n))/g;

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Resolves `horizontal/branding/styles/variables.css` against the configured package roots. */
function resolveImport(spec, fromFile, packageRoots) {
  const relative = resolve(dirname(fromFile), spec);
  if (existsSync(relative)) return relative;

  for (const root of packageRoots) {
    // Packages nest as <root>/<pkgName>/<innerName>/..., and imports are written
    // as `<innerName>/rest/of/path`, so try both <root>/<spec> and <root>/<inner>/<spec>.
    const direct = join(root, spec);
    if (existsSync(direct)) return direct;

    const pkgName = root.split('/').pop();
    const nested = join(root, pkgName, spec.replace(new RegExp(`^${pkgName}/`), ''));
    if (existsSync(nested)) return nested;
  }
  return null;
}

/**
 * Walks the @import graph depth-first and returns a flat Map of raw (unresolved)
 * variable values, with later/child declarations overriding earlier/parent ones.
 */
export function collectVariables(entryFile, packageRoots, seen = new Set()) {
  const vars = new Map();
  const absolute = resolve(entryFile);
  if (seen.has(absolute) || !existsSync(absolute)) return vars;
  seen.add(absolute);

  const raw = readFileSync(absolute, 'utf8');
  const css = stripComments(raw);

  for (const match of css.matchAll(IMPORT_RE)) {
    const imported = resolveImport(match[1], absolute, packageRoots);
    if (imported) {
      for (const [key, value] of collectVariables(imported, packageRoots, seen)) {
        vars.set(key, value);
      }
    }
  }

  for (const match of css.matchAll(DECL_RE)) {
    vars.set(match[1], match[2].trim().replace(/\s+/g, ' '));
  }

  return vars;
}

/** Substitutes `$ref` tokens with their values, recursively, guarding against cycles. */
export function resolveValue(value, vars, stack = new Set()) {
  return value.replace(/\$([A-Za-z0-9_-]+)/g, (whole, name) => {
    if (stack.has(name)) return whole;
    const target = vars.get(name);
    if (target === undefined) return whole;
    return resolveValue(target, vars, new Set([...stack, name]));
  });
}

export function resolveAll(vars) {
  const resolved = new Map();
  for (const [key, value] of vars) {
    resolved.set(key, resolveValue(value, vars));
  }
  return resolved;
}

/**
 * camelCase -> kebab-case for CSS custom property names, splitting letter/digit
 * boundaries too so the palette reads `--gray-02` rather than `--gray02`. That keeps
 * the generated primitives identical to the names the component library already uses.
 */
export function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}
