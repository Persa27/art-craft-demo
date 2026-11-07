// GridCraft: 距離別の認証試験表(架空データ)、数式、グラフ
import { run, publish, scenario, writeBuild } from './lib.mjs';
const { trials, spec } = scenario();
const n = trials.length, last = n + 3;
const rows = [['Distance', 'Trials', 'Passed', 'Pass rate', 'Zone']];
trials.forEach((t, i) => { const r = i + 4; rows.push([`${t.d_m.toFixed(1)} m`, t.trials, t.ok, `=C${r}/B${r}`, `=IF(AND(VALUE(LEFT(A${r},3))>=${spec.auth_near_m},VALUE(LEFT(A${r},3))<=${spec.auth_far_m}),"In range","Out of range")`]); });
const L = [
  ['sheet.rename', { name: 'Trial' }],
  ['cell.set', { cell: 'A1', input: 'TOORU face-auth trial by distance (fictional data)' }],
  ['home.bold', { range: 'A1', on: true }], ['home.fontSize', { range: 'A1', size: 14 }],
  ['range.setValues', { range: 'A3', values: rows }],
  ['home.bold', { range: 'A3:E3', on: true }], ['home.fillColor', { range: 'A3:E3', color: '#0F2A44' }], ['home.fontColor', { range: 'A3:E3', color: '#FFFFFF' }],
  ['home.numberFormat', { range: `D4:D${last}`, format: '0.0%' }],
  ['cell.set', { cell: `A${last + 2}`, input: 'Average pass rate in range' }],
  ['cell.set', { cell: `D${last + 2}`, input: `=AVERAGEIFS(D4:D${last},E4:E${last},"In range")` }],
  ['home.numberFormat', { range: `D${last + 2}`, format: '0.0%' }], ['home.bold', { range: `A${last + 2}:D${last + 2}`, on: true }],
  ['home.columnWidth', { cols: 'A:E', width: 92 }],
  ['insert.chart', { range: `A3:A${last},D3:D${last}`, type: 'line', subtype: 'markers', title: 'Pass rate by distance', at: 'A15', width: 460, height: 260 }],
];
const f = writeBuild('grid/trial.txt', L.map(([id, p]) => `${id}=${JSON.stringify(p)}`).join('\n') + '\n');
const r = run('grid', ['run', '--script', f, '--out', 'grid/trial.xlsx', '--print', `A3:E${last + 2}`], { label: '試験表と数式とグラフを作り xlsx に保存する', quiet: false });
run('grid', ['convert', 'grid/trial.xlsx', 'grid/trial.pdf'], { label: '表を PDF に変換する' });
run('grid', ['eval', `=AVERAGE(95.5,96.5,98.5,99,99.5)`], { quiet: false });
run('pdf', ['render', 'grid/trial.pdf', '--page', '1', '--dpi', '110', '--out', 'grid/trial.png'], { label: 'PDF を PNG に変換して掲載用画像にする' });
publish('grid/trial.png', 'grid-trial.png');
