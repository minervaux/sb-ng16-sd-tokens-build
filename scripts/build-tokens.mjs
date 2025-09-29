// scripts/build-tokens.mjs
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const OUT    = 'src/styles/tokens/';
const BASE   = ['tokens/core/**/*.json'];
const BRANDS = ['alivi', 'green', 'purple', 'red'];
const MODES  = ['light-mode', 'dark-mode'];

function sd(configPath) {
  execSync(`npx style-dictionary build --config "${configPath}"`, { stdio: 'inherit' });
}

async function runConfig(obj) {
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
  // 1) primitives
  await runConfig(
    cfg(BASE,
      [{ destination: '_primitives.scss', format: 'scss/variables' }],
      [{ destination: 'primitives.css',   format: 'css/variables'  }],
    )
  );

  // 2) brands (cada uno aislado)
  for (const b of BRANDS) {
    await runConfig(
      cfg([...BASE, `tokens/theme/${b}.json`],
        [{ destination: `_brand-${b}.scss`, format: 'scss/variables' }],
        [{ destination: `brand-${b}.css`,   format: 'css/variables', options: { selector: `.brand-${b}`, outputReferences: true } }],
      )
    );
  }

  // 3) modes (incluye TODOS los themes para resolver {brand.*})
  for (const m of MODES) {
    const short = m.replace('-mode','');
    await runConfig(
      cfg([...BASE, 'tokens/theme/*.json', `tokens/semantics/${m}.json`],
        [{ destination: `_mode-${short}.scss`, format: 'scss/variables' }],
        [{ destination: `mode-${short}.css`,   format: 'css/variables',
           options: { selector: `.mode-${short}`, outputReferences: true } }],
      )
    );
  }

  console.log('✔ All token bundles built.');
})();
