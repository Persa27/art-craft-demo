// GridCraft: アプリの設計書と結合試験仕様書を 1 冊のブックにする
// 結合試験仕様書の書式は、一般公開されているテスト仕様書テンプレート
// (概要シート + テストケース一覧の 12 列: ID / 大項目 / 中項目 / 小項目 / テスト観点 / 前提条件 /
//  テスト手順 / 期待結果 / 実施結果 / 実施日 / 担当者 / 備考)に合わせている
import fs from 'node:fs';
import path from 'node:path';
import { run, ROOT, publish, writeBuild } from './lib.mjs';

const tests = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'test-cases.json'), 'utf8'));
const done = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'test-results.json'), 'utf8'));
const NAVY = '#0F2A44', PALE = '#E8F1F5';
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
const text = (range, values) => c('range.setValues', { range, values, parse: false });
const head = (range) => {
  c('home.bold', { range, on: true });
  c('home.fillColor', { range, color: NAVY });
  c('home.fontColor', { range, color: '#FFFFFF' });
};
const label = (range) => { c('home.bold', { range, on: true }); c('home.fillColor', { range, color: PALE }); };
const grid = (range) => c('home.borders', { range, preset: 'all', style: 'thin', color: '#9FB3BF' });
const title = (t) => {
  c('cell.set', { cell: 'A1', input: t });
  c('home.bold', { range: 'A1', on: true });
  c('home.fontSize', { range: 'A1', size: 14 });
};
const section = (cell, t) => { c('cell.set', { cell, input: t }); c('home.bold', { range: cell, on: true }); };

// 設計書
c('sheet.rename', { name: '機能一覧' });
title('TOORU 機能一覧(架空)');
c('range.setValues', { range: 'A3', values: functions });
head('A3:D3'); grid('A3:D9');
c('home.columnWidth', { cols: 'A:C', width: 110 });
c('home.columnWidth', { cols: 'D:D', width: 330 });

c('home.insertSheet', { name: '画面項目定義' });
title('認証履歴画面 項目定義(架空)');
c('range.setValues', { range: 'A3', values: items });
head('A3:E3'); grid('A3:E13');
c('home.columnWidth', { cols: 'A:D', width: 90 });
c('home.columnWidth', { cols: 'E:E', width: 300 });

// 結合試験仕様書: 概要シート(管理項目、更新履歴、テスト概要、実施状況)
const SUM = '結合試験_概要', CASES = '結合試験仕様書';
c('home.insertSheet', { name: SUM });
title('TOORU 結合試験仕様書 概要(架空)');
const kv = (row, pairs) => pairs.forEach(([k, v], i) => {
  const r = row + i;
  text(`A${r}`, [[k, v]]);
  c('home.mergeCells', { range: `B${r}:D${r}` });
  label(`A${r}`);
});
section('A3', '管理項目');
kv(4, [['プロジェクト名', 'TOORU ゲートレス顔パス改札(架空)'], ['文書名', '結合試験仕様書'], ['作成者', 'ArtCraft デモ'], ['作成日', done.date], ['版数', '1.0']]);
grid('A4:D8');
section('A10', '更新履歴');
text('A11', [['バージョン', '更新日', '更新者', '更新内容'], ['1.0', done.date, 'ArtCraft デモ', '初版。認証履歴画面の項目(IT-10〜IT-17)を実施']]);
head('A11:D11'); grid('A11:D12');
section('A14', 'テスト概要');
kv(15, [
  ['テスト目的', '機能どうしをつないだときに、データと判定結果が正しく受け渡されることを確かめる'],
  ['テスト範囲(対象)', '映像取得 → 顔認証 → 結果表示・音声通知、顔認証 → 履歴記録 → 認証履歴画面の連携(F-01〜F-06)'],
  ['テスト範囲(対象外)', '各機能の単体の動作、運用時の監視、カメラ設置の工事'],
  ['テスト環境', '実機: 通路 12 m × 6 m、上方カメラ、案内スクリーン、スピーカー(数値は仮の値)/ 画面: 公開デモサイトの認証履歴画面(Chromium 系ブラウザ)'],
  ['使用データ', '架空の認証履歴 240 件。人物は匿名 ID と位置だけで、顔画像と氏名は持たない'],
]);
grid('A15:D19');
c('home.wrapText', { range: 'B15:D19', on: true });
c('home.rowHeight', { rows: '15:19', height: 40 });
section('A21', '実施状況');
const first = 4, last = tests.length + 3, col = (k) => `'${CASES}'!${k}${first}:${k}${last}`;
const count = (v) => `=COUNTIF(${col('I')},"${v}")`;
c('range.setValues', { range: 'A22', values: [
  ['項目数', `=COUNTA(${col('A')})`], ['OK', count('OK')], ['NG', count('NG')], ['保留', count('保留')],
  ['対象外', count('対象外')], ['未実施', count('未実施')], ['消化率', '=(B22-B27)/B22']] });
label('A22:A28'); grid('A22:B28');
c('home.numberFormat', { range: 'B28', format: '0%' });
c('home.bold', { range: 'A28:B28', on: true });
c('home.columnWidth', { cols: 'A:A', width: 150 });
c('home.columnWidth', { cols: 'B:C', width: 110 });
c('home.columnWidth', { cols: 'D:D', width: 420 });

// 結合試験仕様書: テストケース一覧
c('home.insertSheet', { name: CASES });
title('TOORU 結合試験仕様書 テストケース一覧(架空)');
const header = ['ID', '大項目', '中項目', '小項目', 'テスト観点', '前提条件', 'テスト手順', '期待結果', '実施結果', '実施日', '担当者', '備考'];
const rows = tests.map((t) => {
  const r = done.results[t.id];
  return [t.id, t.l1, t.l2, t.l3, t.view, t.pre, t.steps, t.expect, r || '未実施', r ? done.date : '', r ? done.by : '', r ? '公開デモサイトで確認' : '実機が必要なため未実施'];
});
text('A3', [header, ...rows]);
head('A3:L3'); grid(`A3:L${last}`);
c('home.wrapText', { range: `A4:L${last}`, on: true });
c('home.alignTop', { range: `A4:L${last}` });
c('data.validation', { range: `I${first}:I${last}`, type: 'list', formula1: 'OK,NG,保留,対象外,未実施', errorStyle: 'stop' });
c('view.freezePanes', { cell: 'B4' });
[['A', 56], ['B', 150], ['C', 130], ['D', 120], ['E', 230], ['F', 180], ['G', 230], ['H', 220], ['I', 70], ['J', 92], ['K', 70], ['L', 150]]
  .forEach(([k, w]) => c('home.columnWidth', { cols: `${k}:${k}`, width: w }));
c('sheet.activate', { sheet: SUM });

const f = writeBuild('grid/book.txt', L.map(([id, p]) => `${id}=${JSON.stringify(p)}`).join('\n') + '\n');
run('grid', ['run', '--script', f, '--out', 'grid/tooru-design.xlsx', '--quiet'], { label: '設計書 2 シートと結合試験仕様書 2 シートを作る' });
run('grid', ['cat', 'grid/tooru-design.xlsx', '--sheet', SUM, '--range', 'A22:B28'], { label: '別シートを数式で集計した実施状況を確認する', quiet: false });
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-tests.html', '--sheet', CASES], { label: 'シートを HTML に変換する' });
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-summary.html', '--sheet', SUM]);
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-functions.html', '--sheet', '機能一覧']);
run('grid', ['convert', 'grid/tooru-design.xlsx', 'grid/spec-items.html', '--sheet', '画面項目定義']);
run('word', ['convert', 'grid/spec-summary.html', 'grid/spec-summary.pdf'], { label: 'GridCraft の HTML を日本語の PDF にする' });
// テストケース一覧は 12 列あるので、A4 横向きにして列幅を割り振り、見出し行を各ページに繰り返す
const widths = [38, 62, 62, 62, 92, 78, 92, 86, 42, 58, 42, 56].flatMap((w) => ['--cmd', `table.columnWidth={"width":${w}}`, '--cmd', 'text.tab={}']);
run('word', ['run', '--file', 'grid/spec-tests.html', '--cmd', 'layout.orientation={"value":"landscape"}', '--cmd', 'layout.margins={"top":30,"bottom":30,"left":36,"right":36}',
  '--cmd', 'table.deleteRow={}', '--cmd', 'table.deleteRow={}', '--cmd', 'table.repeatHeader={}', ...widths, '--save', 'grid/spec-tests.pdf'], { label: 'テストケース一覧を A4 横の PDF に組む' });
publish('grid/tooru-design.xlsx', 'grid-tooru-design.xlsx');
