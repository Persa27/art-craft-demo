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
