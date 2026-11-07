// WordCraft: Markdown の原稿から仕様書を作る
import { run, publish } from './lib.mjs';
run('word', ['convert', '../data/spec.md', 'word/spec.docx'], { label: 'Markdown 原稿を docx に変換する' });
run('word', ['convert', 'word/spec.docx', 'word/spec.pdf'], { label: 'docx を PDF に変換する' });
run('word', ['render', 'word/spec.docx', 'word/spec.png', '--page', '1'], { label: '1 ページ目を PNG にする' });
publish('word/spec.png', 'word-spec.png');
