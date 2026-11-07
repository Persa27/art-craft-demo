// FigCraft: ディスプレイの画面レイアウト(1920x1080)と結果表示の状態一覧
import { run, publish, writeBuild, BUILD, scenario } from './lib.mjs';
import path from 'node:path';
const { spec } = scenario();
const abs = (p) => path.join(BUILD, p).split(path.sep).join('/');
const S = [];
const c = (command, params) => S.push({ command, params });
c('frame.create', { x: 0, y: 0, width: 1920, height: 1080, name: 'Display layout', props: { fill: '#0B1F33' } });
const JP = { fontFamily: 'Noto Sans JP' };
const box = (x, y, w, h, stroke, name, fill = 'none') => c('node.create', { type: 'rectangle', x, y, width: w, height: h, name, props: { fill, stroke, strokeWeight: 3, cornerRadius: 8 } });
const label = (x, y, text, size = 30, color = '#FFFFFF') => c('text.create', { text, x, y, props: { ...JP, fontSize: size, fill: color } });
box(80, 70, 900, 190, '#27B7D6', 'title-area', '#0F3448'); label(110, 100, 'タイトル領域', 44); label(110, 170, '駅名と案内文。人型と重ならない位置に固定', 28, '#9FDCE9');
box(80, 300, 1760, 660, '#35D07F', 'person-area', '#10283A'); label(110, 325, '人型の表示領域', 44, '#7FE7B0'); label(110, 395, 'カメラ映像と同じ座標に表示(左右反転なし)', 28, '#BFEFD6');
for (const [x, col, t] of [[640, '#8A94A6', '未判定'], [960, '#12A150', '認証 OK'], [1280, '#D92D20', '認証 NG']]) {
  c('node.create', { type: 'ellipse', x: x, y: 520, width: 90, height: 90, name: `head-${t}`, props: { fill: col } });
  c('node.create', { type: 'rectangle', x: x - 25, y: 625, width: 140, height: 260, name: `body-${t}`, props: { fill: col, cornerRadius: 18 } });
  label(x - 20, 900, t, 32);
}
box(80, 990, 900, 62, '#6E8496', 'note-area', '#0F2A3C'); label(110, 1000, '注記領域(シミュレーションの明示)', 26, '#C7D3DC');
label(1420, 110, `${spec.width}×${spec.height} px`, 44, '#9FDCE9'); label(1420, 175, `有効距離 ${spec.auth_near_m}–${spec.auth_far_m} m`, 32, '#9FDCE9');
const f = writeBuild('fig/layout.json', JSON.stringify(S));
run('fig', ['run', f, '--out', 'fig/layout.figcraft'], { label: '画面レイアウトをスクリプトで組む' });
run('fig', ['render', 'fig/layout.figcraft', '--out', 'fig/layout.png', '--scale', '0.5'], { label: 'レイアウトを PNG に書き出す' });
run('fig', ['convert', 'fig/layout.figcraft', 'fig/layout.svg'], { label: 'SVG に変換する' });
publish('fig/layout.png', 'fig-layout.png');

// 認証履歴画面のワイヤーフレーム(1440x900)
const W = [];
const w = (command, params) => W.push({ command, params });
const rect = (x, y, width, height, name, fill = '#FFFFFF', stroke = '#C9D6DC') => w('node.create', { type: 'rectangle', x, y, width, height, name, props: { fill, stroke, strokeWeight: 2, cornerRadius: 6 } });
const tx = (x, y, text, size = 22, color = '#11222F') => w('text.create', { text, x, y, props: { fontFamily: 'Noto Sans JP', fontSize: size, fill: color } });
w('frame.create', { x: 0, y: 0, width: 1440, height: 900, name: 'History screen', props: { fill: '#F2F6F7' } });
rect(0, 0, 1440, 72, 'header', '#0F2A44', '#0F2A44'); tx(32, 18, '認証履歴', 30, '#FFFFFF');
['認証件数', '認証 OK 率', 'NG 件数', '平均応答時間'].forEach((t, i) => { rect(32 + i * 228, 96, 212, 96, `kpi-${i}`); tx(50 + i * 228, 112, t, 18, '#52646F'); tx(50 + i * 228, 140, '000', 28); });
rect(944, 96, 464, 96, 'note', '#E8F1F5'); tx(962, 124, '集計は絞り込みに連動する', 20, '#52646F');
rect(32, 208, 1376, 150, 'chart'); tx(50, 222, '時間帯別の認証件数', 20, '#52646F');
for (let i = 0; i < 17; i++) rect(70 + i * 78, 340 - (20 + (i * 37) % 70), 40, 20 + (i * 37) % 70, `bar-${i}`, '#0D7BA3', '#0D7BA3');
rect(32, 374, 900, 56, 'filters'); tx(50, 388, '結果 / 改札 / キーワード', 20, '#52646F');
rect(32, 446, 900, 420, 'table'); tx(50, 462, '時刻 / 改札 / 匿名 ID / 距離 / 結果', 20, '#52646F');
for (let i = 1; i < 8; i++) rect(50, 462 + i * 48, 864, 2, `row-${i}`, '#C9D6DC', '#C9D6DC');
rect(948, 374, 460, 492, 'detail'); tx(966, 390, '詳細: 人型の位置と判定', 20, '#52646F');
rect(966, 430, 424, 238, 'position', '#20303F', '#20303F'); tx(1090, 536, 'カメラ座標の人型', 22, '#FFFFFF');
const hf = writeBuild('fig/history.json', JSON.stringify(W));
run('fig', ['run', hf, '--out', 'fig/history.figcraft'], { label: '認証履歴画面のワイヤーフレームを組む' });
run('fig', ['render', 'fig/history.figcraft', '--out', 'fig/history.png', '--scale', '0.6']);
publish('fig/history.png', 'fig-history.png');
