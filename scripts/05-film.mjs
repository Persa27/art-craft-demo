// FilmCraft: 背景動画 + 人型(位置キーフレーム) + 結果バナー + 効果音を 1 本に統合する
import { run, publish, scenario, writeBuild, BUILD } from './lib.mjs';
import path from 'node:path';
const { people } = scenario();
const TICKS = 254016000000;
const abs = (p) => path.join(BUILD, p).split(path.sep).join('/');
const line = (id, params) => JSON.stringify({ id, params });
const results = (out) => out.split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));

// 1. プロジェクトと素材
const media = ['effect/screen-bg.mp4', 'photo/person-none.png', 'photo/person-ok.png', 'photo/person-ng.png', 'sound/ok.wav', 'sound/ng.wav', 'vector/banner-ok.png', 'vector/banner-ng.png'];
const s1 = writeBuild('film/1-import.jsonl', [
  line('file.newProject', { name: 'TOORU screen' }),
  line('file.newSequence', { name: 'screen', width: 1920, height: 1080, fps: 30, sampleRate: 48000, video: 4, audio: 2 }),
  line('file.import', { paths: media.map(abs) })].join('\n') + '\n');
const r1 = results(run('film', ['--compact', '--save-as', 'film/tooru.fcproj', 'run', s1], { label: 'シーケンスを作り素材を読み込む' }).out);
const [bg, none, ok, ng, sOk, sNg, bOk, bNg] = r1.at(-1).result.items;
const item = { none, ok, ng };

// 2. 配置: 判定前は灰色、判定の瞬間に結果の色へ切り替える。A と B は同時に歩くので別トラックに置く
const track = { A: 'V2', B: 'V3', C: 'V2' };
const segs = [];
for (const p of people) {
  if (p.tAuth) { segs.push({ p, kind: 'none', t0: p.t0, t1: p.tAuth }); segs.push({ p, kind: p.result, t0: p.tAuth, t1: p.t1 }); }
  else segs.push({ p, kind: 'none', t0: p.t0, t1: p.t1 });
}
const place = [line('timeline.place', { item: bg, track: 'V1', seconds: 0, insert: false, audio: false })];
for (const s of segs) place.push(line('timeline.place', { item: item[s.kind], track: track[s.p.id], seconds: s.t0, duration: { seconds: +(s.t1 - s.t0).toFixed(3) }, insert: false }));
for (const p of people) if (p.tAuth) {
  place.push(line('timeline.place', { item: p.result === 'ok' ? sOk : sNg, track: 'A1', seconds: p.tAuth, insert: false }));
  place.push(line('timeline.place', { item: p.result === 'ok' ? bOk : bNg, track: 'V4', seconds: p.tAuth, duration: { seconds: 3 }, insert: false }));
}
const s2 = writeBuild('film/2-place.jsonl', place.join('\n') + '\n');
const r2 = results(run('film', ['--compact', '--project', 'film/tooru.fcproj', '--save', 'run', s2], { label: '背景、人型、バナー、効果音をタイムラインに置く' }).out);
const clips = r2.map((r) => r.result.clips[0]);
segs.forEach((s, i) => { s.clip = clips[i + 1]; });

// 3. 見取り図上の位置を Motion のキーフレームへ
const at = (p, t) => {
  const k = p.keys; let i = k.findIndex((e) => e.t >= t); if (i <= 0) i = 1;
  const a = k[i - 1], b = k[i], u = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, h: a.h + (b.h - a.h) * u };
};
const kf = [];
for (const s of segs) {
  const ts = [s.t0, ...s.p.keys.map((k) => k.t).filter((t) => t > s.t0 + 0.01 && t < s.t1 - 0.01), s.t1];
  for (const t of ts) {
    const v = at(s.p, t), sc = v.h / 1000, time = Math.round(t * TICKS);
    kf.push(line('effects.setParam', { clip: s.clip, effect: 'motion', param: 'position', value: [+v.x.toFixed(1), +(v.y - 100 * sc).toFixed(1)], time, keyframe: true }));
    kf.push(line('effects.setParam', { clip: s.clip, effect: 'motion', param: 'scale', value: +(sc * 100).toFixed(2), time, keyframe: true }));
  }
}
const s3 = writeBuild('film/3-keyframes.jsonl', kf.join('\n') + '\n');
run('film', ['--compact', '--project', 'film/tooru.fcproj', '--save', 'run', s3], { label: `人物の位置を ${kf.length} 個のキーフレームとして書き込む` });

// 4. 書き出し
const [A, B] = people;
for (const [t, n] of [[2.0, 'walk'], [A.tAuth + 0.1, 'ok'], [B.tAuth + 0.1, 'ng'], [11, 'none']])
  run('film', ['--project', 'film/tooru.fcproj', 'render', '--seconds', String(t), '--out', `film/frame-${n}.png`, '--scale', '0.5'], { label: n === 'ok' ? '認証の瞬間を 1 フレーム PNG にする' : undefined });
run('film', ['--project', 'film/tooru.fcproj', 'export', 'film/tooru-screen.mp4', '--format', 'h264', '--scale', '0.5', '--quality', '70'], { label: '960×540 の H.264 に書き出す' });
run('film', ['probe', 'film/tooru-screen.mp4'], { quiet: false, label: '書き出した動画の情報を確認する' });
publish('film/tooru-screen.mp4', 'film-tooru-screen.mp4');
for (const n of ['ok', 'ng', 'none', 'walk']) publish(`film/frame-${n}.png`, `film-frame-${n}.png`);
