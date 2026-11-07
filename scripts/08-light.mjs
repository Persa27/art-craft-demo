// LightCraft: カメラ映像風の画像を「暗い時間帯の映像」に見立てて、明るさを補正する
import { run, publish } from './lib.mjs';
run('light', ['render', 'photo/camera-frame.png', '-o', 'light/before.jpg', '--set', 'light.exposure=-1.8', '--size', '960'], { label: '露出を下げて暗い映像を再現する' });
run('light', ['render', 'light/before.jpg', '-o', 'light/after.jpg', '--set', 'light.exposure=1.6', '--set', 'light.shadows=40', '--size', '960'], { label: '露出とシャドウを補正して書き出す' });
publish('light/before.jpg', 'light-before.jpg'); publish('light/after.jpg', 'light-after.jpg');
