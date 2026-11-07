// VectorCraft: ロゴ、人型、OK/NG の印、カメラ視点の通路図
import { run, steps, writeBuild, publish, scenario } from './lib.mjs';
const { spec } = scenario();
const PERSON = 'M70 262 Q70 230 110 230 H290 Q330 230 330 262 V600 Q330 625 305 625 H290 V958 Q290 990 258 990 Q226 990 226 958 V640 H174 V958 Q174 990 142 990 Q110 990 110 958 V625 H95 Q70 625 70 600 Z';
const fill = (color) => [{ command: 'select.none', params: {} }, { command: 'paint.setFill', params: { color } }, { command: 'paint.setStroke', params: { none: true } }];
const stroke = (color, w) => [{ command: 'select.none', params: {} }, { command: 'paint.setFill', params: { none: true } }, { command: 'paint.setStroke', params: { color, weight: w } }];
const doc = (w, h, name) => ({ command: 'file.new', params: { width: w, height: h, units: 'Pixels', name } });

// 人型(3色)
for (const [name, color] of [['ok', '#12A150'], ['ng', '#D92D20'], ['none', '#8A94A6']]) {
  const f = writeBuild(`vector/person-${name}.jsonl`, steps([doc(400, 1000, `person-${name}`), ...fill(color),
    { command: 'shape.ellipse', params: { x: 105, y: 20, width: 190, height: 190 } },
    { command: 'path.create', params: { d: PERSON } }]));
  run('vector', ['run', '--commands', f, '--export', `vector/person-${name}.png`, '--export', `vector/person-${name}.svg`, '--scale', '1'],
    { label: name === 'ok' ? '人型を描いて PNG と SVG に書き出す' : undefined });
}
// OK/NG の印
const ok = writeBuild('vector/mark-ok.jsonl', steps([doc(200, 200, 'mark-ok'), ...fill('#12A150'), { command: 'shape.ellipse', params: { x: 4, y: 4, width: 192, height: 192 } },
  ...stroke('#FFFFFF', 24), { command: 'path.create', params: { d: 'M52 104 L88 140 L150 66' } }, { command: 'stroke.set', params: { weight: 22, cap: 'round', join: 'round' } }]));
const ng = writeBuild('vector/mark-ng.jsonl', steps([doc(200, 200, 'mark-ng'), ...fill('#D92D20'), { command: 'shape.ellipse', params: { x: 4, y: 4, width: 192, height: 192 } },
  ...stroke('#FFFFFF', 24), { command: 'path.create', params: { d: 'M62 62 L138 138' } }, { command: 'stroke.set', params: { weight: 22, cap: 'round' } }, { command: 'path.create', params: { d: 'M138 62 L62 138' } }, { command: 'stroke.set', params: { weight: 22, cap: 'round' } }]));
run('vector', ['run', '--commands', ok, '--export', 'vector/mark-ok.png', '--export', 'vector/mark-ok.svg', '--scale', '1']);
run('vector', ['run', '--commands', ng, '--export', 'vector/mark-ng.png', '--export', 'vector/mark-ng.svg', '--scale', '1']);
// ロゴ
const logo = writeBuild('vector/logo.jsonl', steps([doc(760, 220, 'TOORU logo'),
  ...stroke('#0F2A44', 18), { command: 'shape.ellipse', params: { x: 30, y: 30, width: 160, height: 160 } }, { command: 'stroke.set', params: { weight: 14 } },
  ...fill('#0E8FB0'), { command: 'shape.ellipse', params: { x: 88, y: 56, width: 44, height: 44 } },
  { command: 'path.create', params: { d: 'M72 158 Q72 112 110 112 Q148 112 148 158 Z' } },
  ...fill('#0F2A44'),
  { command: 'text.create', params: { x: 222, y: 138, text: 'TOORU', size: 104, font: 'Noto Sans JP', style: 'Bold', color: '#0F2A44' } },
  { command: 'text.create', params: { x: 226, y: 186, text: '顔認証改札ディスプレイ 実証実験', size: 30, font: 'Noto Sans JP', style: 'Medium', color: '#0E8FB0' } }]));
run('vector', ['run', '--commands', logo, '--export', 'vector/logo.vectorcraft', '--export', 'vector/logo.png', '--scale', '2'], { label: 'ロゴを描いて書き出す' });
run('vector', ['convert', 'vector/logo.vectorcraft', 'vector/logo.svg', '--outline-text'], { label: '文字をアウトライン化した SVG に変換する' });

// カメラ視点の通路(scenario と同じ投影式)
const th = spec.camera_tilt_deg * Math.PI / 180;
const P = (X, d, h) => { const dy = spec.camera_height_m - h, zc = d * Math.cos(th) + dy * Math.sin(th), yc = -d * Math.sin(th) + dy * Math.cos(th); return [spec.width / 2 + spec.focal_px * X / zc, spec.height / 2 + spec.focal_px * yc / zc].map((v) => +v.toFixed(1)); };
const poly = (pts) => ({ command: 'path.create', params: { d: 'M' + pts.map((p) => p.join(' ')).join(' L') + ' Z' } });
const W = 3.5, H = spec.ceiling_m, near = 1.2, far = 16;
const s = [doc(1920, 1080, 'camera-view'), ...fill('#20303F'), { command: 'shape.rectangle', params: { x: 0, y: 0, width: 1920, height: 1080 } },
  ...fill('#3E5163'), poly([P(-W, near, 0), P(W, near, 0), P(W, far, 0), P(-W, far, 0)]),
  ...fill('#2B3C4C'), poly([P(-W, near, 0), P(-W, far, 0), P(-W, far, H), P(-W, near, H)]), poly([P(W, near, 0), P(W, far, 0), P(W, far, H), P(W, near, H)]),
  ...fill('#566B7F'), poly([P(-W, near, H), P(W, near, H), P(W, far, H), P(-W, far, H)]),
  ...fill('#C8DCE8'), poly([P(-W, far, 0), P(W, far, 0), P(W, far, H), P(-W, far, H)])];
for (let d = 3; d < far; d += 3) s.push(...fill('#F1F7FA'), poly([P(-0.5, d, H), P(0.5, d, H), P(0.5, d + 1.2, H), P(-0.5, d + 1.2, H)]));
s.push(...stroke('#6E8496', 2));
for (let d = 2; d < far; d += 1) s.push({ command: 'shape.line', params: { x1: P(-W, d, 0)[0], y1: P(-W, d, 0)[1], x2: P(W, d, 0)[0], y2: P(W, d, 0)[1] } });
s.push(...stroke('#35D07F', 6), poly([P(-W, spec.auth_near_m, 0), P(W, spec.auth_near_m, 0), P(W, spec.auth_far_m, 0), P(-W, spec.auth_far_m, 0)]), { command: 'stroke.set', params: { weight: 6 } });
const cam = writeBuild('vector/camera-view.jsonl', steps(s));
run('vector', ['run', '--commands', cam, '--export', 'vector/camera-view.png', '--scale', '1'], { label: 'カメラ視点の通路図を座標から描く' });
publish('vector/camera-view.png', 'vector-camera-view.png');
for (const f of ['logo.png', 'logo.svg', 'person-ok.svg', 'person-ng.svg', 'person-none.svg', 'mark-ok.svg', 'mark-ng.svg']) publish('vector/' + f, 'vector-' + f);
