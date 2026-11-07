// VectorCraft: ロゴ、人型、OK/NG の印、結果バナー、通路の見取り図
import { run, steps, writeBuild, publish, scenario } from './lib.mjs';
const { spec } = scenario();
const PERSON = 'M70 262 Q70 230 110 230 H290 Q330 230 330 262 V600 Q330 625 305 625 H290 V958 Q290 990 258 990 Q226 990 226 958 V640 H174 V958 Q174 990 142 990 Q110 990 110 958 V625 H95 Q70 625 70 600 Z';
const fill = (color) => [{ command: 'select.none', params: {} }, { command: 'paint.setFill', params: { color } }, { command: 'paint.setStroke', params: { none: true } }];
const stroke = (color, w) => [{ command: 'select.none', params: {} }, { command: 'paint.setFill', params: { none: true } }, { command: 'paint.setStroke', params: { color, weight: w } }];
const doc = (w, h, name) => ({ command: 'file.new', params: { width: w, height: h, units: 'Pixels', name } });
const label = (x, y, text, size, color, style = 'Medium') => ({ command: 'text.create', params: { x, y, text, size, font: 'Noto Sans JP', style, color } });

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
// 結果バナー(案内スクリーンの右上に出す。全画面の透過 PNG)
for (const [name, color, head, body] of [['ok', '#12A150', '認証 OK', 'そのままお通りください'], ['ng', '#D92D20', '認証 NG', '係員にお声がけください']]) {
  const f = writeBuild(`vector/banner-${name}.jsonl`, steps([doc(1920, 1080, `banner-${name}`), ...fill(color),
    { command: 'shape.rectangle', params: { x: 1120, y: 60, width: 720, height: 170 } },
    ...fill('#FFFFFF'), label(1160, 130, head, 60, '#FFFFFF', 'Bold'), label(1160, 200, body, 42, '#FFFFFF')]));
  run('vector', ['run', '--commands', f, '--export', `vector/banner-${name}.png`, '--scale', '1'], { label: name === 'ok' ? '結果バナーを透過 PNG に書き出す' : undefined });
}
// ロゴ
const logo = writeBuild('vector/logo.jsonl', steps([doc(760, 220, 'TOORU logo'),
  ...stroke('#0F2A44', 18), { command: 'shape.ellipse', params: { x: 30, y: 30, width: 160, height: 160 } }, { command: 'stroke.set', params: { weight: 14 } },
  ...fill('#0E8FB0'), { command: 'shape.ellipse', params: { x: 88, y: 56, width: 44, height: 44 } },
  { command: 'path.create', params: { d: 'M72 158 Q72 112 110 112 Q148 112 148 158 Z' } },
  ...fill('#0F2A44'),
  { command: 'text.create', params: { x: 222, y: 138, text: 'TOORU', size: 104, font: 'Noto Sans JP', style: 'Bold', color: '#0F2A44' } },
  { command: 'text.create', params: { x: 226, y: 186, text: 'ゲートレス顔パス改札 デモ', size: 30, font: 'Noto Sans JP', style: 'Medium', color: '#0E8FB0' } }]));
run('vector', ['run', '--commands', logo, '--export', 'vector/logo.vectorcraft', '--export', 'vector/logo.png', '--scale', '2'], { label: 'ロゴを描いて書き出す' });
run('vector', ['convert', 'vector/logo.vectorcraft', 'vector/logo.svg', '--outline-text'], { label: '文字をアウトライン化した SVG に変換する' });

// 通路の見取り図(scenario と同じ座標変換)
const { x0, sx, y0, sy } = spec.plan;
const px = (X) => x0 + sx * X, py = (Y) => y0 + sy * Y;
const rect = (X0, X1, Y0, Y1) => ({ command: 'shape.rectangle', params: { x: px(X0), y: py(Y0), width: sx * (X1 - X0), height: sy * (Y1 - Y0) } });
const L = spec.passage_length_m, HW = spec.passage_width_m / 2, ZW = spec.zone_half_width_m;
const s = [doc(1920, 1080, 'plan-view'), ...fill('#20303F'), { command: 'shape.rectangle', params: { x: 0, y: 0, width: 1920, height: 1080 } },
  ...fill('#3E5163'), rect(0, L, -HW, HW),
  ...fill('#2F6B57'), rect(spec.zone_near_m, spec.zone_far_m, -ZW, ZW)];
s.push(...stroke('#6E8496', 2));
for (let X = 1; X < L; X += 1) s.push({ command: 'shape.line', params: { x1: px(X), y1: py(-HW), x2: px(X), y2: py(HW) } });
s.push(...stroke('#35D07F', 6), rect(spec.zone_near_m, spec.zone_far_m, -ZW, ZW), { command: 'stroke.set', params: { weight: 6 } });
s.push(...fill('#FFFFFF'), label(px(spec.zone_near_m) + 16, py(-ZW) + 48, '認証エリア', 34, '#BFEFD6'), label(60, py(0) + 12, 'コンコース', 34, '#C7D3DC'), label(px(L) + 24, py(0) + 12, 'ホーム', 34, '#C7D3DC'));
const plan = writeBuild('vector/plan-view.jsonl', steps(s));
run('vector', ['run', '--commands', plan, '--export', 'vector/plan-view.png', '--scale', '1'], { label: '通路の見取り図を座標から描く' });
publish('vector/plan-view.png', 'vector-plan-view.png');
for (const f of ['logo.png', 'logo.svg', 'person-ok.svg', 'person-ng.svg', 'person-none.svg', 'mark-ok.svg', 'mark-ng.svg']) publish('vector/' + f, 'vector-' + f);
