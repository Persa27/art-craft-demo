// すべての成果物を最初から作り直す: node scripts/build-all.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, BUILD, ASSETS } from './lib.mjs';
fs.rmSync(BUILD, { recursive: true, force: true }); fs.rmSync(ASSETS, { recursive: true, force: true });
for (const d of ['vector', 'photo', 'sound', 'effect', 'film', 'cad', 'grid', 'light', 'fig', 'deck', 'word', 'design', 'pdf']) fs.mkdirSync(path.join(BUILD, d), { recursive: true });
fs.mkdirSync(ASSETS, { recursive: true });
const order = ['00-scenario', '01-vector', '02-photo', '03-sound', '04-effect', '05-film', '06-cad', '07-grid', '08-light', '09-fig', '10-deck', '11-word', '12-design', '13-pdf', 'build-site'];
for (const s of order) {
  const p = path.join(ROOT, 'scripts', s + '.mjs');
  if (!fs.existsSync(p)) { console.log('skip', s); continue; }
  const r = spawnSync(process.execPath, [p], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
