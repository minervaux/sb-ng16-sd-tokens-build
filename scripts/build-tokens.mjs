// scripts/build-tokens.mjs
// Construye bundles separados evitando colisiones:
// - primitives  -> solo core
// - brand-*     -> core + theme/<brand>
// - mode-*      -> core + semantics/<mode>  (SIN brands)
// En runtime combinas clases: <html class="brand-alivi mode-light">

import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const OUT    = 'src/styles/tokens/';
const BASE   = ['tokens/core/**/*.json'];
const BRANDS = ['alivi', 'green', 'purple', 'red'];     // ajusta si agregas más
const MODES  = ['light-mode', 'dark-mode'];             // nombres de tus files en tokens/semantics/*.json

// Lee flag --verbose si lo pasas por NPM: `npm run tokens:build -- --verbose`
const WANT_VERBOSE = process.argv.includes('--verbose');
if (WANT_VERBOSE) process.env.SD_LOG_VERBOSITY = 'verbose';

function sd(configPath) {
  const cmd = `npx style-dictionary build --config "${configPath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

async function runConfig(obj) {
  // Forzar verbosidad desde config si pasaste --verbose
  if (WANT_VERBOSE) {
    obj.log = { verbosity: 'verbose' };
  }
  const dir = await mkdtemp(join(tmpdir(), 'sd-'));
  const file = join(dir, 'config.json');
  await writeFile(file, JSON.stringify(obj, null, 2));
  try { sd(file); } finally { await rm(dir, { recursive: true, force: true }); }
}

function cfg(source, filesScss, filesCss) {
  return {
    source,
    platforms: {
      scss: { transformGroup: 'scss', buildPath: OUT, files: filesScss },
      css:  { transformGroup: 'css',  buildPath: OUT, files: filesCss },
    }
  };
}

(async () => {
  // 1) PRIMITIVES: solo core → no hay colisiones aquí
  await runConfig(
    cfg(
      BASE,
      [{ destination: '_primitives.scss', format: 'scss/variables' }],
      [{ destination: 'primitives.css',   format: 'css/variables'  }],
    )
  );

  // 2) BRANDS: cada brand aislada → core + theme/<brand>.json
  for (const b of BRANDS) {
    await runConfig(
      cfg(
        [...BASE, `tokens/theme/${b}.json`],
        [
          { destination: `_brand-${b}.scss`, format: 'scss/variables' }
        ],
        [
          {
            destination: `brand-${b}.css`,
            format: 'css/variables',
            options: { selector: `.brand-${b}`, outputReferences: true }
          }
        ],
      )
    );
  }

  // 3) MODES: solo core + semantics/<mode>.json (SIN brands)
  //    Los tokens semánticos referenciarán a --brand-* gracias a outputReferences.
  for (const m of MODES) {
    const short = m.replace('-mode',''); // "light" | "dark"
    await runConfig(
      cfg(
        [...BASE, `tokens/semantics/${m}.json`],
        [
          {
            destination: `_mode-${short}.scss`,
            format: 'scss/variables',
            options: { outputReferences: true }
          }
        ],
        [
          {
            destination: `mode-${short}.css`,
            format: 'css/variables',
            options: { selector: `.mode-${short}`, outputReferences: true }
          }
        ],
      )
    );
  }

  console.log('✔ All token bundles built.');
})();
