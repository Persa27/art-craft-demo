// GridCraft: アプリの設計書とテスト仕様書を 1 冊のブックにする
import fs from 'node:fs';
import path from 'node:path';
import { run, ROOT, publish, writeBuild } from './lib.mjs';

const tests = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'test-cases.json'), 'utf8'));
const results = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'test-results.json'), 'utf8'));
const NAVY = '#0F2A44';
const functions = [['機能 ID', '機能', '担当', '概要'],
  ['F-01', '映像取得', '上方カメラ', '通路を歩く人の顔を撮影する'],
  ['F-02', '顔認証', '顔認証システム', '認証エリア内の人物を判定する'],
  ['F-03', '結果表示', '案内スクリーン', '判定結果を人型と案内文で表示する'],
  ['F-04', '音声通知', 'スピーカー', '判定結果に応じて OK 音と NG 音を鳴らす'],
  ['F-05', '履歴記録', '顔認証システム', '匿名 ID、位置、結果を記録する'],
  ['F-06', '認証履歴確認', 'ブラウザ', '履歴の検索、集計、詳細確認を行う']];
const items = [['No', '区分', '項目', '形式', '説明'],
  [1, '集計', '認証件数', '数値', '絞り込み後の件数'],
  [2, '集計', '認証 OK 率', '%', 'OK ÷(OK + NG)'],
  [3, '集計', '平均応答時間', 'ms', '判定した履歴の平均'],
  [4, '検索', '結果', '選択', 'すべて / OK / NG / 未判定'],
  [5, '検索', '通路', '選択', 'すべて / 1〜3 番'],
  [6, '検索', 'キーワード', '文字', 'イベント ID または匿名 ID'],
  [7, '一覧', '時刻', '時:分:秒', '既定は新しい順'],
  [8, '一覧', '位置', 'm', '通路入口からの距離。見出しで並び替え'],
  [9, '一覧', '結果', '文字 + 印', '色だけに頼らず表示する'],
  [10, '詳細', '人型の位置', '図', '見取り図上の人型。顔画像は持たない']];

const L = [];
const c = (id, p) => L.push([id, p]);
const head = (range) => {
  c('home.bold', { range, on: true });
  c('home.fillColor', { range, color: NAVY });
  c('home.fontColor', { range, color: '#FFFFFF' });
};
const title = (t) => {
  c('cell.set', { cell: 'A1', input: t });
  c('home.bold', { range: 'A1', on: true });
  c('home.fontSize', { range: 'A1', size: 14 });
};

c('sheet.rename', { name: '機能一覧' });
title('TOORU 機能一覧(架空)');
c('range.setValues', { range: 'A3', values: functions });
head('A3:D3');
c('home.columnWidth', { cols: 'A:C', width: 110 });
c('home.columnWidth', { cols: 'D:D', width: 330 });

c('home.insertSheet', { name: '画面項目定義' });
title('認証履歴画面 項目定義(架空)');
c('range.setValues', { range: 'A3', values: items });
head('A3:E3');
c('home.columnWidth', { cols: 'A:D', width: 90 });
c('home.columnWidth', { cols: 'E:E', width: 300 });

c('home.insertSheet', { name: 'テスト仕様書' });
title('TOORU テスト仕様書(架空)');
const last = tests.length + 3;
const rows = [['ID', '区分', '手順', '期待結果', '結果'], ...tests.map((t) => [...t, results[t[0]] || '未実施'])];
c('range.setValues', { range: 'A3', values: rows });
head('A3:E3');
c('home.columnWidth', { cols: 'A:A', width: 56 });
c('home.columnWidth', { cols: 'B:B', width: 110 });
c('home.columnWidth', { cols: 'C:D', width: 300 });
c('home.columnWidth', { cols: 'E:E', width: 70 });
const s = last + 2;
c('range.setValues', { range: `C${s}`, values: [['合格', `=COUNTIF(E4:E${last},"合格")`], ['未実施', `=COUNTIF(E4:E${last},"未実施")`], ['消化率', `=D${s}/COUNTA(E4:E${last})`]] });
c('home.numberFormat', { range: `D${s + 2}`, format: '0%' });
c('home.bold', { range: `C${s}:D${s + 2}`, on: true });

const f = writeBuild('grid/book.txt', L.map(([id, p]) => `${id}=${JSON.stringify(p)}`).join('\n') + '\n');
run('grid', ['run', '--script', f, '--out', 'grid/tooru-design.xlsx', '--quiet'], { label: '機能一覧、画面項目定義、テスト仕様書の 3 シートを作る' });
run('grid', ['cat', 'grid/tooru-design.xlsx', '--sheet', 'テスト仕様書', '--range', `C${s}:D${s + 2}`], { label: '数式で集計した消化率を確認する', quiet: false });
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-functions.html', '--sheet', '機能一覧'], { label: 'シートを HTML に変換する' });
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-items.html', '--sheet', '画面項目定義']);
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-tests.html', '--sheet', 'テスト仕様書']);
run('word', ['convert', 'grid/spec-tests.html', 'grid/spec-tests.pdf'], { label: 'GridCraft の HTML を日本語の PDF にする' });
publish('grid/tooru-design.xlsx', 'grid-tooru-design.xlsx');
