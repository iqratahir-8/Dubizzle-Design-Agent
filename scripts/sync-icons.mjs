#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { normalizeName, categorize, CATEGORY_ORDER } from './lib/icon-taxonomy.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(ROOT, 'design-sync.config.json'), 'utf8'));
const monorepo = process.argv[2] || config.monorepoPath;

if (!existsSync(monorepo)) {
  console.error(`Monorepo not found: ${monorepo}`);
  process.exit(1);
}

/* Precedence mirrors how @app resolves for dubizzle-eg: the first package that owns a
   filename is the one that actually renders. eg and facelift are taken wholesale (they
   are the EG visual layer); horizontal and strat are huge and shared across every country
   and Bayut, so only icons the EG-reachable source actually imports are pulled in. */
const SOURCES = [
  { dir: 'frontend/dubizzle-eg/dubizzle-eg/assets/icons', pkg: 'dubizzle-eg', takeAll: true },
  { dir: 'frontend/dubizzle-facelift/dubizzle-facelift/assets/icons', pkg: 'dubizzle-facelift', takeAll: true },
  { dir: 'frontend/horizontal/assets/icons', pkg: 'horizontal', takeAll: false },
  { dir: 'frontend/horizontal/horizontal/assets/icons', pkg: 'horizontal', takeAll: false },
  { dir: 'frontend/strat/assets/icons', pkg: 'strat', takeAll: false },
  { dir: 'frontend/strat/strat/assets/icons', pkg: 'strat', takeAll: false },
];

const SEARCH_PACKAGES = ['dubizzle-eg', 'dubizzle-facelift', 'horizontal'];

console.log('Scanning source for icon imports...');
const referenced = new Set();
for (const pkg of SEARCH_PACKAGES) {
  const dir = join(monorepo, 'frontend', pkg);
  if (!existsSync(dir)) continue;
  try {
    const out = execSync(
      `grep -rhoE "assets/icons/[A-Za-z0-9_.-]+\\.(svg|webp|png)" "${dir}" --include="*.tsx" --include="*.ts" || true`,
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    for (const line of out.split('\n')) {
      const name = line.trim().split('/').pop();
      if (name) referenced.add(name);
    }
  } catch {
    /* grep exits non-zero when nothing matches; the `|| true` covers it */
  }
}
console.log(`  ${referenced.size} distinct icon files imported by EG-reachable source`);

const picked = new Map(); // normalized name -> record
const skipped = { lowerPrecedence: 0, unreferenced: 0, nonIcon: 0 };

for (const source of SOURCES) {
  const dir = join(monorepo, source.dir);
  if (!existsSync(dir)) continue;

  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase();
    if (!['.svg', '.webp', '.png'].includes(ext)) {
      skipped.nonIcon++;
      continue;
    }
    // Favicons and PWA chrome are app config, not design-system icons.
    if (/^(android-chrome|apple-touch|favicon|mstile)/i.test(file)) {
      skipped.nonIcon++;
      continue;
    }
    if (!source.takeAll && !referenced.has(file)) {
      skipped.unreferenced++;
      continue;
    }

    const normalized = normalizeName(file);
    if (picked.has(normalized)) {
      skipped.lowerPrecedence++;
      continue;
    }

    picked.set(normalized, {
      name: normalized,
      file: join(dir, file),
      originalName: file,
      package: source.pkg,
      ext: ext.slice(1),
      category: categorize(normalized),
      usedInSource: referenced.has(file),
    });
  }
}

/**
 * Webpack inlines these SVGs as React components, where the HTML parser implies the SVG
 * namespace — so upstream never needed `xmlns`. Referenced via `<img src>` (how the static
 * templates use them) a missing namespace makes the browser refuse to render, silently.
 */
function writeSvgWithNamespace(from, to) {
  const svg = readFileSync(from, 'utf8');
  if (/<svg[^>]*\sxmlns=/.test(svg)) {
    copyFileSync(from, to);
    return false;
  }
  writeFileSync(to, svg.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"'));
  return true;
}

const outDir = join(ROOT, 'design-kit/icons');
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const byCategory = new Map();
let namespaceFixes = 0;
for (const icon of [...picked.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const categoryDir = join(outDir, icon.category);
  mkdirSync(categoryDir, { recursive: true });
  const dest = join(categoryDir, `${icon.name}.${icon.ext}`);
  if (icon.ext === 'svg') {
    if (writeSvgWithNamespace(icon.file, dest)) namespaceFixes++;
  } else {
    copyFileSync(icon.file, dest);
  }

  if (!byCategory.has(icon.category)) byCategory.set(icon.category, []);
  byCategory.get(icon.category).push({
    name: icon.name,
    path: `icons/${icon.category}/${icon.name}.${icon.ext}`,
    package: icon.package,
    originalName: icon.originalName,
    usedInSource: icon.usedInSource,
  });
}

const manifest = {
  generated: 'scripts/sync-icons.mjs',
  total: picked.size,
  categories: Object.fromEntries(
    CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => [c, byCategory.get(c)]),
  ),
};
writeFileSync(join(outDir, 'icons.json'), JSON.stringify(manifest, null, 2));
writeFileSync(join(outDir, 'index.html'), renderIndex(byCategory, picked.size));

console.log(`\nExtracted ${picked.size} icons (${namespaceFixes} had missing xmlns, repaired)`);
for (const c of CATEGORY_ORDER) {
  if (byCategory.has(c)) console.log(`  ${c.padEnd(12)} ${byCategory.get(c).length}`);
}
console.log(
  `\nSkipped: ${skipped.unreferenced} unreferenced (horizontal/strat), ${skipped.lowerPrecedence} shadowed by higher-precedence package`,
);
console.log('Wrote design-kit/icons/ + icons.json + index.html');

function renderIndex(byCategory, total) {
  const sections = CATEGORY_ORDER.filter((c) => byCategory.has(c))
    .map((category) => {
      const tiles = byCategory
        .get(category)
        .map(
          (icon) => `      <figure class="tile">
        <img src="${category}/${icon.name}.${icon.path.split('.').pop()}" alt="${icon.name}" loading="lazy">
        <figcaption>${icon.name}</figcaption>
      </figure>`,
        )
        .join('\n');
      return `    <section>
      <h2>${category} <span class="count">${byCategory.get(category).length}</span></h2>
      <div class="grid">
${tiles}
      </div>
    </section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>dubizzle Egypt — Icon Library</title>
<link rel="stylesheet" href="../tokens/tokens.css">
<style>
  html { font-size: 10px; }
  body { margin: 0; padding: 3.2rem; background: #fff; font-family: var(--font-ltr), sans-serif; color: var(--gray-06); }
  h1 { font-size: 2.4rem; margin: 0 0 .4rem; }
  .lede { color: var(--gray-05); font-size: 1.4rem; margin: 0 0 3.2rem; }
  h2 { font-size: 1.6rem; text-transform: uppercase; letter-spacing: .05rem; margin: 3.2rem 0 1.2rem; }
  .count { color: var(--gray-04); font-weight: 400; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: .8rem; }
  .tile { margin: 0; padding: 1.2rem .8rem; border: 1px solid var(--gray-02); border-radius: var(--radius-md, .6rem);
          display: flex; flex-direction: column; align-items: center; gap: .8rem; background: #fff; }
  .tile:hover { background: var(--gray-00); }
  .tile img { width: 2.4rem; height: 2.4rem; object-fit: contain; }
  figcaption { font-size: 1rem; color: var(--gray-05); text-align: center; word-break: break-word; line-height: 1.3; }
</style>
</head>
<body>
  <h1>Icon Library</h1>
  <p class="lede">${total} icons resolved for dubizzle Egypt. Use these — never emoji, never an external icon pack.</p>
${sections}
</body>
</html>
`;
}
