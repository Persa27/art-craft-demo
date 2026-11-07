// EffectCraft: ディスプレイの背景動画を JavaScript で組み立ててレンダリングする
import { run, publish } from './lib.mjs';
run('effect', ['script', '../scripts/display-bg.jsx', '--empty', '--save-as', 'effect/bg.ecproj'], { label: 'JavaScript でコンポジションを組み立てる' });
run('effect', ['render', '--project', 'effect/bg.ecproj', '--comp', 'display-bg', '--out', 'effect/display-bg.mp4', '--format', 'h264', '--bitrate', '8000'], { label: '15 秒の背景動画をレンダリングする' });
run('effect', ['render-frame', '--project', 'effect/bg.ecproj', '--comp', 'display-bg', '--time', '5', '--out', 'effect/display-bg.png', '--max-side', '960'], { label: '確認用に 1 フレームを PNG にする' });
publish('effect/display-bg.png', 'effect-frame.png');
