// CADCraft: ゲートのない改札通路の断面図と平面図(単位 mm、数値は仮の値)
import { run, publish, scenario } from './lib.mjs';
const { spec } = scenario();
const c = []; const cmd = (id, p = {}) => c.push('--cmd', `${id} ${JSON.stringify(p)}`);
const mm = (m) => m * 1000;
const H = mm(spec.ceiling_m), CH = mm(spec.camera_height_m), CX = mm(spec.camera_pos_m), N = mm(spec.zone_near_m), F = mm(spec.zone_far_m), L = mm(spec.passage_length_m), HW = mm(spec.passage_width_m) / 2, ZW = mm(spec.zone_half_width_m);
cmd('layer.new', { name: 'STRUCT', color: 'white', lineweight: 0.5 });
cmd('layer.new', { name: 'EQUIP', color: 4, lineweight: 0.35 });
cmd('layer.new', { name: 'ZONE', color: 3, lineweight: 0.35 });
cmd('layer.new', { name: 'PERSON', color: 8, lineweight: 0.25 });
cmd('layer.new', { name: 'DIM', color: 1, lineweight: 0.18 });
cmd('layer.new', { name: 'NOTE', color: 'white', lineweight: 0.18 });
cmd('dimstyle', { name: 'MM', current: true, DIMTXT: 170, DIMASZ: 130, DIMEXO: 50, DIMEXE: 80, DIMGAP: 40 });
// 断面図
cmd('layer.current', { name: 'STRUCT' });
cmd('line', { points: [[0, 0], [L, 0]] }); cmd('line', { points: [[0, H], [L, H]] });
cmd('layer.current', { name: 'EQUIP' });
cmd('rectang', { p1: [CX - 90, CH - 70], p2: [CX + 90, H] }); // 上方カメラ
cmd('rectang', { p1: [7700, H - 120], p2: [8100, H] }); // スピーカー
cmd('rectang', { p1: [10000, 1300], p2: [11600, 2200] }); // 案内スクリーン(壁面)
// 認証エリア
cmd('layer.current', { name: 'ZONE' });
cmd('rectang', { p1: [N, 0], p2: [F, 60] });
cmd('line', { points: [[CX, CH - 70], [F, 1500]] }); cmd('line', { points: [[CX, CH - 70], [N, 1500]] });
cmd('line', { points: [[N, 0], [N, 1700]] }); cmd('line', { points: [[F, 0], [F, 1700]] });
// 人物(身長 1,700)
cmd('layer.current', { name: 'PERSON' });
for (const x of [5000]) { cmd('circle', { center: [x, 1590], radius: 110 }); cmd('rectang', { p1: [x - 170, 780], p2: [x + 170, 1460] }); cmd('rectang', { p1: [x - 120, 0], p2: [x + 120, 780] }); }
// 寸法
cmd('layer.current', { name: 'DIM' });
cmd('dimlinear', { p1: [0, 0], p2: [0, H], at: [-520, H / 2] });
cmd('dimlinear', { p1: [0, 0], p2: [N, 0], at: [N / 2, -420] });
cmd('dimlinear', { p1: [0, 0], p2: [F, 0], at: [F / 2, -860] });
// 注記
cmd('layer.current', { name: 'NOTE' });
const t = (at, text, h = 190) => cmd('text', { at, text, height: h });
t([0, H + 300], '断面図(架空の設定、数値は仮の値)', 240);
t([CX + 180, CH - 340], '上方カメラ'); t([7200, H - 460], 'スピーカー'); t([10000, 2320], '案内スクリーン'); t([N + 150, 180], '認証エリア');
// 平面図
const Y = -5600;
cmd('layer.current', { name: 'STRUCT' });
cmd('line', { points: [[0, Y + HW], [L, Y + HW]] }); cmd('line', { points: [[0, Y - HW], [L, Y - HW]] });
cmd('layer.current', { name: 'EQUIP' });
cmd('rectang', { p1: [10000, Y + HW - 120], p2: [11600, Y + HW] });
cmd('circle', { center: [CX, Y], radius: 130 });
cmd('layer.current', { name: 'ZONE' });
cmd('rectang', { p1: [N, Y - ZW], p2: [F, Y + ZW] });
cmd('layer.current', { name: 'DIM' });
cmd('dimlinear', { p1: [N, Y - ZW], p2: [F, Y - ZW], at: [(N + F) / 2, Y - HW - 520] });
cmd('dimlinear', { p1: [0, Y - HW], p2: [0, Y + HW], at: [-520, Y] });
cmd('layer.current', { name: 'NOTE' });
t([0, Y + HW + 300], '平面図(ゲートなし)', 240); t([N + 300, Y], '認証エリア'); t([CX + 200, Y - 80], '上方カメラ'); t([10000, Y + HW - 420], '案内スクリーン');
run('cad', ['run', '--metric', ...c, '--save', 'cad/gate.dxf'], { label: '断面図と平面図を作図して DXF に保存する' });
run('cad', ['run', 'cad/gate.dxf', '--export', 'cad/gate.png', '--window=-1400,-9700,12700,4400'], { label: '図面全体を PNG に書き出す' });
run('cad', ['convert', 'cad/gate.dxf', 'cad/gate.pdf'], { label: '図面を PDF に変換する' });
publish('cad/gate.png', 'cad-gate.png');
