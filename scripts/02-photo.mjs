// PhotoCraft: 人型 + 印を合成した透過 PNG と、カメラ映像風の合成画像
import { run, publish, scenario } from './lib.mjs';
import path from 'node:path'; import { BUILD } from './lib.mjs';
const abs = (p) => path.join(BUILD, p).split(path.sep).join('/');
const { people } = scenario();
const glow = { ok: '#35D07F', ng: '#FF6B5E', none: '#FFFFFF' };
for (const k of ['ok', 'ng', 'none']) {
  const a = ['run', '--new', JSON.stringify({ width: 500, height: 1200, background: 'transparent', name: `person-${k}` }),
    '--cmd', 'file.placeEmbedded', '--params', JSON.stringify({ path: abs(`vector/person-${k}.png`), center: [250, 700], scale: 100, fit: false, smartObject: false }),
    '--cmd', 'layer.layerStyle.outerGlow', '--params', JSON.stringify({ color: glow[k], opacity: 70, size: 24, spread: 8 })];
  if (k !== 'none') a.push('--cmd', 'file.placeEmbedded', '--params', JSON.stringify({ path: abs(`vector/mark-${k}.png`), center: [250, 105], scale: 95, fit: false, smartObject: false }));
  a.push('--out', `photo/person-${k}.png`);
  run('photo', a, { label: k === 'ok' ? '人型と印を合成して透過 PNG にする' : undefined });
}
// ある瞬間のカメラ映像風画像: 人物 A が有効距離で認証された瞬間
const key = (p, t) => p.keys.reduce((b, c) => Math.abs(c.t - t) < Math.abs(b.t - t) ? c : b);
const A = people[0], kA = key(A, A.tAuth + 0.05);
const place = (file, k) => ['--cmd', 'file.placeEmbedded', '--params', JSON.stringify({ path: abs(file), center: [k.x, k.y - 100 * k.h / 1000], scale: k.h / 10, fit: false, smartObject: false })];
run('photo', ['run', abs('vector/camera-view.png'),
  '--cmd', 'filter.blur.gaussianBlur', '--params', '{"radius":1.6}',
  '--cmd', 'filter.noise.addNoise', '--params', '{"amount":5,"distribution":"gaussian","monochromatic":true,"seed":7}',
  ...place('photo/person-ok.png', kA),
  '--cmd', 'layer.newAdjustmentLayer.colorLookup', '--params', '{"lut":"cool"}',
  '--cmd', 'type.create', '--params', JSON.stringify({ x: 48, y: 72, text: `CAM-01  ${kA.t.toFixed(2)}s  距離 ${kA.d_m}m  シミュレーション`, font: 'Noto Sans JP', size: 34, color: '#FFFFFF' }),
  '--out', 'photo/camera-frame.png'], { label: 'カメラ映像風の画像を合成する' });
publish('photo/person-ok.png', 'photo-person-ok.png'); publish('photo/person-ng.png', 'photo-person-ng.png'); publish('photo/person-none.png', 'photo-person-none.png');
publish('photo/camera-frame.png', 'photo-camera-frame.png');
