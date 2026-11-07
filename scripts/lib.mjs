// 共通ランナー: CLI を実行し、成功したコマンドだけを site/commands.json 用のログに残す
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BUILD = path.join(ROOT, 'build');
export const ASSETS = path.join(ROOT, 'site', 'assets');
const LOG = path.join(BUILD, 'commands.json');
const NAMES = { cad: 'CADCraft', deck: 'DeckCraft', design: 'DesignCraft', effect: 'EffectCraft', fig: 'FigCraft', film: 'FilmCraft', grid: 'GridCraft', light: 'LightCraft', pdf: 'PdfCraft', photo: 'PhotoCraft', sound: 'SoundCraft', vector: 'VectorCraft', word: 'WordCraft' };
export const exe = (t) => path.join('C:/Program Files', NAMES[t], t + 'craft-cli.exe');

export const scenario = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'scenario.json'), 'utf8'));
export const writeBuild = (name, text) => { const p = path.join(BUILD, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return name; };
export const steps = (arr) => arr.map((a) => JSON.stringify(a)).join('\n') + '\n';

function log(entry) {
  let all = [];
  try { all = JSON.parse(fs.readFileSync(LOG, 'utf8')); } catch {}
  all = all.filter((e) => !(e.tool === entry.tool && e.label === entry.label));
  all.push(entry);
  fs.writeFileSync(LOG, JSON.stringify(all, null, 1));
}

// cwd は build/。label を付けた実行だけがサイトに載る
export function run(tool, args, { label, quiet = true, allowFail = false } = {}) {
  const t0 = Date.now();
  const r = spawnSync(exe(tool), args, { cwd: BUILD, encoding: 'utf8', maxBuffer: 1 << 28 });
  const ms = Date.now() - t0; if (r.error) console.error(r.error);
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0 && !allowFail) { console.error(out.slice(-3000)); throw new Error(`${tool} failed (${r.status}): ${args.join(' ').slice(0, 300)}`); }
  if (!quiet) console.log(out.slice(0, 3000));
  console.log(`[${tool}] ${label || args[0]} exit=${r.status} ${ms}ms`);
  if (label && r.status === 0) log({ tool, label, args, ms, exit: r.status });
  return { out, status: r.status, ms };
}
export function publish(from, to) { fs.copyFileSync(path.join(BUILD, from), path.join(ASSETS, to || path.basename(from))); }
