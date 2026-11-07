// 架空の仕様と人物の動きを定義し、カメラ座標(=ディスプレイ座標)を計算する
import fs from 'node:fs'; import path from 'node:path'; import { ROOT } from './lib.mjs';
const spec = { station: 'あさなぎ線 ひかり台駅', system: 'TOORU', ceiling_m: 3.0, display_bottom_m: 2.2, display_height_m: 0.6, camera_height_m: 2.5, camera_tilt_deg: 12, width: 1920, height: 1080, focal_px: 1100, auth_near_m: 2.0, auth_far_m: 4.0, fps: 30, duration_s: 15, person_height_m: 1.7 };
const th = spec.camera_tilt_deg * Math.PI / 180;
// カメラ前方距離 d, 横位置 X, 高さ h の点を画素へ投影
function proj(X, d, h) {
  const dy = spec.camera_height_m - h;
  const zc = d * Math.cos(th) + dy * Math.sin(th);
  const yc = -d * Math.sin(th) + dy * Math.cos(th);
  return [spec.width / 2 + spec.focal_px * X / zc, spec.height / 2 + spec.focal_px * yc / zc];
}
const people = [
  { id: 'A', result: 'ok', label: '認証 OK', t0: 0.5, d0: 6.5, d1: 1.6, X0: -0.7, X1: -0.5, speed: 1.3, authAt_m: 3.0 },
  { id: 'B', result: 'ng', label: '認証 NG', t0: 5.0, d0: 6.5, d1: 1.6, X0: 0.7, X1: 0.5, speed: 1.3, authAt_m: 3.0 },
  { id: 'C', result: 'none', label: '未判定', t0: 9.8, d0: 6.0, d1: 6.0, X0: 3.2, X1: -3.2, speed: 1.4, authAt_m: null },
];
for (const p of people) {
  const dist = Math.hypot(p.d1 - p.d0, p.X1 - p.X0);
  p.t1 = +(p.t0 + dist / p.speed).toFixed(3);
  p.keys = [];
  const n = Math.ceil((p.t1 - p.t0) / 0.25);
  for (let i = 0; i <= n; i++) {
    const u = i / n, t = p.t0 + (p.t1 - p.t0) * u, d = p.d0 + (p.d1 - p.d0) * u, X = p.X0 + (p.X1 - p.X0) * u;
    const head = proj(X, d, spec.person_height_m), foot = proj(X, d, 0);
    const hpx = foot[1] - head[1];
    p.keys.push({ t: +t.toFixed(3), d_m: +d.toFixed(2), x: +head[0].toFixed(1), y: +((head[1] + foot[1]) / 2).toFixed(1), h: +hpx.toFixed(1) });
  }
  if (p.authAt_m) { p.tAuth = +(p.t0 + (p.d0 - p.authAt_m) / (p.d0 - p.d1) * (p.t1 - p.t0)).toFixed(3); }
}
// 距離別の架空試験データ(実測ではない)
const trials = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((d) => {
  const rate = { 1.5: 71.0, 2.0: 96.5, 2.5: 99.0, 3.0: 99.5, 3.5: 98.5, 4.0: 95.5, 4.5: 78.0, 5.0: 52.5 }[d];
  return { d_m: d, trials: 200, ok: Math.round(rate * 2), rate };
});
// 認証履歴(架空)。顔画像や氏名は持たず、匿名 ID だけを記録する
let seed = 20261102;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pad = (n, w = 2) => String(n).padStart(w, '0');
const peak = [0, 0, 0, 0, 0, 0, 2, 5, 9, 6, 3, 2, 3, 2, 2, 3, 3, 5, 8, 6, 4, 3, 2, 0];
const hours = peak.flatMap((w, h) => Array(w).fill(h));
const raw = [];
for (let i = 0; i < 237; i++) {
  const h = hours[Math.floor(rnd() * hours.length)], sec = h * 3600 + Math.floor(rnd() * 3600), r = rnd();
  const result = r < 0.87 ? 'ok' : r < 0.95 ? 'ng' : 'none';
  const d = result === 'none' ? (rnd() < 0.5 ? 1.2 + rnd() * 0.7 : 4.2 + rnd() * 1.8) : 2 + rnd() * 2;
  raw.push({ sec, result, d, X: (rnd() - 0.5) * 2.4, gate: 1 + Math.floor(rnd() * 3), reason: result === 'ng' ? (rnd() < 0.7 ? '未登録' : '類似度不足') : null, ms: result === 'none' ? null : 90 + Math.floor(rnd() * 130) });
}
raw.sort((a, b) => a.sec - b.sec);
// 完成動画の 3 人を最新の履歴として加える
const base = 22 * 3600 + 50 * 60;
const demo = people.map((p, i) => {
  const t = p.tAuth || 12;
  const k = p.keys.reduce((b, c) => (Math.abs(c.t - t) < Math.abs(b.t - t) ? c : b));
  return { sec: base + i * 5, result: p.result, d: k.d_m, gate: 2, reason: p.result === 'ng' ? '未登録' : null, ms: p.tAuth ? 128 + i * 16 : null, scene: p.tAuth ? +p.tAuth.toFixed(1) : 11, person: p.id, x: Math.round(k.x), y: Math.round(k.y), h: Math.round(k.h) };
});
const history = [...raw, ...demo].map((e, i) => {
  let { x, y, h } = e;
  if (x === undefined) { const q = proj(e.X, e.d, spec.person_height_m), f = proj(e.X, e.d, 0); x = Math.round(q[0]); h = Math.round(f[1] - q[1]); y = Math.round((q[1] + f[1]) / 2); }
  return { id: `E-${pad(i + 1, 4)}`, time: `${pad(Math.floor(e.sec / 3600))}:${pad(Math.floor(e.sec / 60) % 60)}:${pad(e.sec % 60)}`, gate: e.gate, anon: `G-${Math.floor(rnd() * 65536).toString(16).toUpperCase().padStart(4, '0')}`, d: +e.d.toFixed(2), result: e.result, reason: e.reason, ms: e.ms, x, y, h, scene: e.scene, person: e.person };
});
fs.writeFileSync(path.join(ROOT, 'data', 'history.json'), JSON.stringify(history));
console.log('history', history.length);
fs.writeFileSync(path.join(ROOT, 'data', 'scenario.json'), JSON.stringify({ spec, people, trials }, null, 1));
for (const p of people) console.log(p.id, p.t0, p.t1, p.tAuth, p.keys[0], p.keys.at(-1));
