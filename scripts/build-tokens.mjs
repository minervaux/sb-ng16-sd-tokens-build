// scripts/build-tokens.mjs
// Build sin colisiones, sin API de SD, y con "px" agregado SOLO a categorías numéricas
// de tokens/core antes de invocar el CLI de Style Dictionary.
// Mantiene JSON originales de Figma intactos.

import { writeFile, mkdtemp, rm, mkdir, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const OUT    = 'src/styles/tokens/';
const BASE   = ['tokens/core/**/*.json'];
const BRANDS = ['alivi', 'green', 'purple', 'red'];
const MODES  = ['light-mode', 'dark-mode'];

// Verbosidad opcional: `npm run tokens:build -- --verbose`
const WANT_VERBOSE = process.argv.includes('--verbose');
if (WANT_VERBOSE) process.env.SD_LOG_VERBOSITY = 'verbose';

// Categorías de TOP-LEVEL en core a las que se les agrega "px" si su value es number
const PX_CATEGORIES = new Set(['corner', 'spacing', 'border-width', 'graphic-size', 'size']);

// Util: normaliza ruta a estilo POSIX para globs de SD en Windows
const toPosix = p => resolve(p).replace(/\\/g, '/');

// --------- Procesamiento de JSON de core (añadir px) ----------
async function processCoreJsonFile(srcPath, dstPath) {
  const raw = await readFile(srcPath, 'utf8');
  const json = JSON.parse(raw);

  // Solo tocamos niveles top-level que sean categorías en PX_CATEGORIES
  for (const topKey of Object.keys(json)) {
    if (!PX_CATEGORIES.has(topKey)) continue;
    json[topKey] = addPxDeep(json[topKey]);
  }

  await mkdir(dirname(dstPath), { recursive: true });
  await writeFile(dstPath, JSON.stringify(json, null, 2), 'utf8');
}

function addPxDeep(node) {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    // Token tipo { value, type } → si value es number, agréga "px"
    if (Object.prototype.hasOwnProperty.call(node, 'value')) {
      const v = node.value;
      const t = node.type;
      if (typeof v === 'number' && (t === 'number' || t === undefined)) {
        return { ...node, value: `${v}px` };
      }
      // Si ya tiene unidad o no es number, lo dejamos igual
      return node;
    }
    // Si es un grupo, procesar recursivo
    const out = {};
    for (const k of Object.keys(node)) {
      out[k] = addPxDeep(node[k]);
    }
    return out;
  }
  return node;
}

async function collectCoreFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...await collectCoreFiles(full));
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

// --------- Runner de SD por CLI, con config temporal ----------
function sd(configPath) {
  const cmd = `npx style-dictionary build --config "${configPath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

async function runConfig(obj) {
  if (WANT_VERBOSE) obj.log = { verbosity: 'verbose' };
  const dir = await mkdtemp(join(tmpdir(), 'sd-'));
  const file = join(dir, 'config.json');
  await writeFile(file, JSON.stringify(obj, null, 2), 'utf8');
  try { sd(file); } finally { await rm(dir, { recursive: true, force: true }); }
}

function cfg(source, filesScss, filesCss) {
  return {
    source,
    platforms: {
      scss: { transformGroup: 'scss', buildPath: OUT, files: filesScss },
      css:  { transformGroup: 'css',  buildPath: OUT, files: filesCss  },
    }
  };
}

// --------- Main ----------
(async () => {
  // 1) Preprocesar SOLO tokens/core -> a una carpeta temporal espejo
  const tmpRoot = await mkdtemp(join(tmpdir(), 'tokens-core-'));
  const tmpCoreRoot = join(tmpRoot, 'tokens', 'core');
  const coreFiles = await collectCoreFiles('tokens/core');

  await Promise.all(coreFiles.map(async (src) => {
    const rel = src.replace(/^[\\\/]*tokens[\\\/]core[\\\/]?/i, ''); // relativo a tokens/core
    const dst = join(tmpCoreRoot, rel);
    await processCoreJsonFile(src, dst);
  }));

  const CORE_GLOB = toPosix(join(tmpRoot, 'tokens', 'core', '**/*.json'));

  // 2) PRIMITIVES: usar core procesado (con px)
  await runConfig(
    cfg(
      [CORE_GLOB],
      [{ destination: '_primitives.scss', format: 'scss/variables' }],
      [{ destination: 'primitives.css',   format: 'css/variables'  }],
    )
  );

  // 3) BRANDS: core procesado + theme/<brand>.json (originales)
  for (const b of BRANDS) {
    await runConfig(
      cfg(
        [CORE_GLOB, toPosix(`tokens/theme/${b}.json`)],
        [{ destination: `_brand-${b}.scss`, format: 'scss/variables' }],
        [{
          destination: `brand-${b}.css`,
          format: 'css/variables',
          options: { selector: `.brand-${b}`, outputReferences: true }
        }],
      )
    );
  }

 // 4) MODES: core procesado + UNA brand (para resolver refs) + semantics/<mode>.json
for (const m of MODES) {
  const short = m.replace('-mode',''); // "light" | "dark"
  await runConfig(
    cfg(
      [
        CORE_GLOB,                          // core (con px)
        toPosix('tokens/theme/alivi.json'), // una sola brand para satisfacer brand.* 
        toPosix(`tokens/semantics/${m}.json`)
      ],
      [{
        destination: `_mode-${short}.scss`,
        format: 'scss/variables',
        options: { outputReferences: true }
      }],
      [{
        destination: `mode-${short}.css`,
        format: 'css/variables',
        options: { selector: `.mode-${short}`, outputReferences: true }
      }],
    )
  );
}


  console.log('✔ All token bundles built (with px on core numeric categories).');
})();
