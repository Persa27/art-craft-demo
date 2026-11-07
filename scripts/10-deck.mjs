// DeckCraft: 導入提案スライド(4 枚)
import { run, publish, scenario, BUILD } from './lib.mjs';
import path from 'node:path';
const { spec } = scenario();
const abs = (p) => path.join(BUILD, p).split(path.sep).join('/');
const c = []; const cmd = (id, p) => c.push('--cmd', `${id}=${JSON.stringify(p)}`);
cmd('design.fonts', { major: 'Noto Sans JP', minor: 'Noto Sans JP' });
cmd('slide.new', { layout: 'title', title: 'TOORU 顔パス改札', body: `${spec.station} ゲートレス改札のご提案(架空)` });
cmd('slide.new', { layout: 'titleAndContent', title: 'ねらい', body: `タッチもゲートもなく、歩いたまま改札を通過できる\n認証結果を音と画面でその場で伝える\n車椅子や大きな荷物でも通りやすい通路にする\n1 分間に ${spec.throughput_per_min} 人の認証を目標にする` });
cmd('slide.new', { layout: 'titleOnly', title: 'システム構成' });
const box = (x, t, color) => { cmd('shape.insert', { preset: 'roundRect', rect: [x, 200, 200, 110], text: t }); cmd('shape.fill', { color }); };
box(50, '上方カメラ\n通路全体を撮影', '#0E8FB0'); box(380, '顔認証\n通行者を判定', '#0F2A44'); box(710, 'スピーカーと画面\n結果を通知', '#12A150');
cmd('shape.insert', { preset: 'rightArrow', rect: [262, 235, 106, 40] }); cmd('shape.fill', { color: '#8A94A6' });
cmd('shape.insert', { preset: 'rightArrow', rect: [592, 235, 106, 40] }); cmd('shape.fill', { color: '#8A94A6' });
cmd('slide.new', { layout: 'titleOnly', title: `通路入口から ${spec.zone_near_m}〜${spec.zone_far_m} m で認証` });
cmd('insert.picture', { path: abs('photo/monitor-frame.png'), rect: [180, 130, 600, 338] });
cmd('slide.delete', { index: 0 }); // 新規文書の空白スライドを消す
run('deck', ['run', ...c, '--save', 'deck/proposal.deckcraft'], { label: '4 枚のスライドを作って保存する' });
run('deck', ['convert', 'deck/proposal.deckcraft', 'deck/proposal.pptx'], { label: 'PowerPoint 形式に変換する' });
run('deck', ['convert', 'deck/proposal.deckcraft', 'deck/proposal.pdf'], { label: 'PDF に変換する' });
run('deck', ['render', 'deck/proposal.deckcraft', '--all', '--scale', '1', 'deck/slides'], { label: 'スライドを PNG に書き出す' });
for (const n of [1, 2, 3, 4]) publish(`deck/slides/slide-0${n}.png`, `deck-slide-${n}.png`);
