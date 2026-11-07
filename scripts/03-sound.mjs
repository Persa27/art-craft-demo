// SoundCraft: 内蔵シンセと MIDI ノートから認証 OK/NG の効果音を合成する
import { run, publish } from './lib.mjs';
const c = (id, p) => ['--cmd', `${id}=${JSON.stringify(p)}`];
const synth = (name, params, notes, reverb, seconds) => {
  const a = ['run', ...c('track.new', { kind: 'instrument', format: 'stereo', name, instrument: 'subtractive_synth' }),
    ...c('mix.insert', { track: 1, plugin: 'plate_reverb', params: reverb }),
    ...c('midi.new_clip', { track: 1, start: 0, length: 48000 })];
  for (const [pitch, start_ticks, length_ticks] of notes) a.push(...c('midi.note_add', { clip: 2, pitch, start_ticks, length_ticks, velocity: 120 }));
  return a;
};
// プラグイン本体のパラメータは instrument スロットへの指定方法を確認できないため既定音色 + リバーブで作る
const ok = synth('OK', {}, [[76, 0, 180], [83, 180, 420]], { mix: 22, decay: 0.8 }, 1.0);
run('sound', [...ok, '--bounce', 'sound/ok-raw.wav', '--start', '0', '--end', '1.0'], { label: '認証 OK 音を MIDI ノートから合成する' });
const ng = synth('NG', {}, [[52, 0, 200], [52, 280, 320]], { mix: 12, decay: 0.5 }, 1.0);
run('sound', [...ng, '--bounce', 'sound/ng-raw.wav', '--start', '0', '--end', '1.0'], { label: '認証 NG 音を MIDI ノートから合成する' });
run('sound', ['convert', 'sound/ok-raw.wav', 'sound/ok.wav', '--bit-depth', '16', '--normalize'], { label: '音量を正規化して 16bit WAV にする' });
run('sound', ['convert', 'sound/ng-raw.wav', 'sound/ng.wav', '--bit-depth', '16', '--normalize']);
publish('sound/ok.wav', 'sound-ok.wav'); publish('sound/ng.wav', 'sound-ng.wav');
