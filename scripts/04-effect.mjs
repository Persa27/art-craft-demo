// EffectCraft: 案内スクリーンの背景動画を JavaScript で組み立ててレンダリングする
import { run, publish } from './lib.mjs';
run('effect', ['script', '../scripts/screen-bg.jsx', '--empty', '--save-as', 'effect/bg.ecproj'], { label: 'JavaScript でコンポジションを組み立てる' });
run('effect', ['render', '--project', 'effect/bg.ecproj', '--comp', 'screen-bg', '--out', 'effect/screen-bg.mp4', '--format', 'h264', '--bitrate', '8000'], { label: '15 秒の背景動画をレンダリングする' });
run('effect', ['render-frame', '--project', 'effect/bg.ecproj', '--comp', 'screen-bg', '--time', '5', '--out', 'effect/screen-bg.png', '--max-side', '960'], { label: '確認用に 1 フレームを PNG にする' });
run('effect', ['render', '--project', 'effect/bg.ecproj', '--comp', 'screen-bg', '--out', 'effect/screen-bg-web.mp4', '--format', 'h264', '--resolution', 'half', '--bitrate', '2500'], { label: 'Web 掲載用に 960×540 でレンダリングする' });
publish('effect/screen-bg.png', 'effect-frame.png');
publish('effect/screen-bg-web.mp4', 'effect-screen-bg.mp4');
