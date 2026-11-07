// CADCraft: 改札の断面図と平面図(単位 mm)
import { run, publish, scenario, writeBuild } from './lib.mjs';
const { spec } = scenario();
const c = []; const cmd = (id, p = {}) => c.push('--cmd', `${id} ${JSON.stringify(p)}`);
const H = spec.ceiling_m * 1000, DB = spec.display_bottom_m * 1000, DT = DB + spec.display_height_m * 1000, CH = spec.camera_height_m * 1000, N = spec.auth_near_m * 1000, F = spec.auth_far_m * 1000;
cmd('layer.new', { name: 'STRUCT', color: 'white', lineweight: 0.5 });
cmd('layer.new', { name: 'EQUIP', color: 4, lineweight: 0.35 });
cmd('layer.new', { name: 'ZONE', color: 3, lineweight: 0.35 });
cmd('layer.new', { name: 'PERSON', color: 8, lineweight: 0.25 });
cmd('layer.new', { name: 'DIM', color: 1, lineweight: 0.18 });
cmd('layer.new', { name: 'NOTE', color: 'white', lineweight: 0.18 });
cmd('dimstyle', { name: 'MM', current: true, DIMTXT: 110, DIMASZ: 90, DIMEXO: 40, DIMEXE: 60, DIMGAP: 30 });
// 断面図
cmd('layer.current', { name: 'STRUCT' });
cmd('line', { points: [[-2200, 0], [6400, 0]] }); cmd('line', { points: [[-2200, H], [6400, H]] });
cmd('layer.current', { name: 'EQUIP' });
cmd('rectang', { p1: [-90, DB], p2: [0, DT] });
cmd('line', { points: [[-45, DT], [-45, H]] });
cmd('rectang', { p1: [0, CH - 45], p2: [130, CH + 45] });
cmd('rectang', { p1: [-1500, 0], p2: [-300, 1000] });
// 有効距離
cmd('layer.current', { name: 'ZONE' });
cmd('rectang', { p1: [N, 0], p2: [F, 60] });
cmd('line', { points: [[130, CH], [F, 1500]] }); cmd('line', { points: [[130, CH], [N, 1500]] });
cmd('line', { points: [[N, 0], [N, 1700]] }); cmd('line', { points: [[F, 0], [F, 1700]] });
// 人物(身長 1,700)
cmd('layer.current', { name: 'PERSON' });
for (const x of [3000]) { cmd('circle', { center: [x, 1590], radius: 110 }); cmd('rectang', { p1: [x - 170, 780], p2: [x + 170, 1460] }); cmd('rectang', { p1: [x - 120, 0], p2: [x + 120, 780] }); }
// 寸法
cmd('layer.current', { name: 'DIM' });
cmd('dimlinear', { p1: [-2200, 0], p2: [-2200, H], at: [-2500, H / 2] });
cmd('dimlinear', { p1: [-90, 0], p2: [-90, DB], at: [-700, DB / 2 + 200] });
cmd('dimlinear', { p1: [130, 0], p2: [130, CH], at: [520, CH / 2] });
cmd('dimlinear', { p1: [0, 0], p2: [N, 0], at: [N / 2, -320] });
cmd('dimlinear', { p1: [0, 0], p2: [F, 0], at: [F / 2, -640] });
// 注記
cmd('layer.current', { name: 'NOTE' });
const t = (at, text, h = 130) => cmd('text', { at, text, height: h });
t([-2200, H + 240], '断面図(架空の設定)', 170);
t([-1500, 1100], '改札機'); t([230, CH + 40], 'カメラ'); t([-1200, DB + 240], 'ディスプレイ'); t([F + 150, 150], '有効距離 2.0-4.0m');
// 平面図
const Y = -4400;
cmd('layer.current', { name: 'STRUCT' });
cmd('line', { points: [[-2200, Y + 1750], [6400, Y + 1750]] }); cmd('line', { points: [[-2200, Y - 1750], [6400, Y - 1750]] });
cmd('layer.current', { name: 'EQUIP' });
for (const y of [-1200, 0, 1200]) cmd('rectang', { p1: [-1500, Y + y - 110], p2: [-300, Y + y + 110] });
cmd('rectang', { p1: [-90, Y - 900], p2: [0, Y + 900] });
cmd('layer.current', { name: 'ZONE' });
cmd('rectang', { p1: [N, Y - 1400], p2: [F, Y + 1400] });
cmd('layer.current', { name: 'DIM' });
cmd('dimlinear', { p1: [N, Y - 1400], p2: [F, Y - 1400], at: [(N + F) / 2, Y - 2100] });
cmd('layer.current', { name: 'NOTE' });
t([-2200, Y + 2050], '平面図', 170); t([N + 300, Y], '認証エリア(架空)');
run('cad', ['run', '--metric', ...c, '--save', 'cad/gate.dxf'], { label: '断面図と平面図を作図して DXF に保存する' });
run('cad', ['run', 'cad/gate.dxf', '--export', 'cad/gate.png', '--window=-3000,-6900,6800,3700'], { label: '図面全体を PNG に書き出す' });
run('cad', ['convert', 'cad/gate.dxf', 'cad/gate.pdf'], { label: '図面を PDF に変換する' });
publish('cad/gate.png', 'cad-gate.png');
