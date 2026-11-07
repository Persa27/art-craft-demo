// 架空の仕様と人物の動きを定義し、通路の見取り図上の座標を計算する。数値はすべて仮の値
import fs from 'node:fs'; import path from 'node:path'; import { ROOT } from './lib.mjs';
const spec = {
  station: 'あさなぎ線 ひかり台駅', system: 'TOORU',
  ceiling_m: 3.5, camera_height_m: 3.3, camera_pos_m: 9.0, camera_res: '3840×2160',
  passage_length_m: 12, passage_width_m: 6, zone_near_m: 3, zone_far_m: 7, zone_half_width_m: 2,
  throughput_per_min: 100, width: 1920, height: 1080, fps: 30, duration_s: 15,
  // 見取り図: 入口からの位置 X と横位置 Y(m)を画面の px へ変換する
  plan: { x0: 300, sx: 110, y0: 640, sy: 90 }, person_px: 240,
};
const toPx = (X, Y) => [spec.plan.x0 + spec.plan.sx * X, spec.plan.y0 + spec.plan.sy * Y];
const people = [
  { id: 'A', result: 'ok', label: '認証 OK', t0: 0.3, X0: 0, X1: 12, Y0: -1.0, Y1: -1.0, speed: 1.5, authAt_m: 5.0 },
  { id: 'B', result: 'ng', label: '認証 NG', t0: 4.3, X0: 0, X1: 12, Y0: 1.0, Y1: 1.0, speed: 1.5, authAt_m: 5.0 },
  { id: 'C', result: 'none', label: '未判定', t0: 9.2, X0: 1.5, X1: 1.5, Y0: -3.0, Y1: 3.0, speed: 1.4, authAt_m: null },
];
for (const p of people) {
  const dist = Math.hypot(p.X1 - p.X0, p.Y1 - p.Y0);
  p.t1 = +(p.t0 + dist / p.speed).toFixed(3);
  p.keys = [];
  const n = Math.ceil((p.t1 - p.t0) / 0.25);
  for (let i = 0; i <= n; i++) {
    const u = i / n, t = p.t0 + (p.t1 - p.t0) * u, X = p.X0 + (p.X1 - p.X0) * u, Y = p.Y0 + (p.Y1 - p.Y0) * u;
    const [x, y] = toPx(X, Y);
    p.keys.push({ t: +t.toFixed(3), d_m: +X.toFixed(2), x: +x.toFixed(1), y: +y.toFixed(1), h: spec.person_px });
  }
  if (p.authAt_m) p.tAuth = +(p.t0 + (p.authAt_m - p.X0) / (p.X1 - p.X0) * (p.t1 - p.t0)).toFixed(3);
}
// 認証履歴(架空)。顔画像や氏名は持たず、匿名 ID だけを記録する
let seed = 20261107;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pad = (n, w = 2) => String(n).padStart(w, '0');
const peak = [0, 0, 0, 0, 0, 0, 2, 5, 9, 6, 3, 2, 3, 2, 2, 3, 3, 5, 8, 6, 4, 3, 2, 0];
const hours = peak.flatMap((w, h) => Array(w).fill(h));
const raw = [];
for (let i = 0; i < 237; i++) {
  const h = hours[Math.floor(rnd() * hours.length)], sec = h * 3600 + Math.floor(rnd() * 3600), r = rnd();
  const result = r < 0.87 ? 'ok' : r < 0.95 ? 'ng' : 'none';
  const d = result === 'none' ? (rnd() < 0.5 ? 0.8 + rnd() * 2.1 : 7.1 + rnd() * 3) : 3 + rnd() * 4;
  raw.push({ sec, result, d, Y: (rnd() - 0.5) * 4, gate: 1 + Math.floor(rnd() * 3), reason: result === 'ng' ? (rnd() < 0.7 ? '未登録' : '類似度不足') : null, ms: result === 'none' ? null : 90 + Math.floor(rnd() * 130) });
}
raw.sort((a, b) => a.sec - b.sec);
// 完成動画の 3 人を最新の履歴として加える
const base = 22 * 3600 + 59 * 60;
const demo = people.map((p, i) => {
  const t = p.tAuth || 11;
  const k = p.keys.reduce((b, c) => (Math.abs(c.t - t) < Math.abs(b.t - t) ? c : b));
  return { sec: base + i * 5, result: p.result, d: k.d_m, gate: 2, reason: p.result === 'ng' ? '未登録' : null, ms: p.tAuth ? 128 + i * 16 : null, scene: p.tAuth ? +p.tAuth.toFixed(1) : 11, person: p.id, x: Math.round(k.x), y: Math.round(k.y), h: k.h };
});
const history = [...raw, ...demo].map((e, i) => {
  let { x, y, h } = e;
  if (x === undefined) { [x, y] = toPx(e.d, e.Y).map(Math.round); h = spec.person_px; }
  return { id: `E-${pad(i + 1, 4)}`, time: `${pad(Math.floor(e.sec / 3600))}:${pad(Math.floor(e.sec / 60) % 60)}:${pad(e.sec % 60)}`, gate: e.gate, anon: `G-${Math.floor(rnd() * 65536).toString(16).toUpperCase().padStart(4, '0')}`, d: +e.d.toFixed(2), result: e.result, reason: e.reason, ms: e.ms, x, y, h, scene: e.scene, person: e.person };
});
fs.writeFileSync(path.join(ROOT, 'data', 'history.json'), JSON.stringify(history));
console.log('history', history.length);
fs.writeFileSync(path.join(ROOT, 'data', 'scenario.json'), JSON.stringify({ spec, people }, null, 1));
for (const p of people) console.log(p.id, p.t0, p.t1, p.tAuth, p.keys[0], p.keys.at(-1));
