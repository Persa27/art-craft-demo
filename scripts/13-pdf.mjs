// PdfCraft: 仕様書、図面、結合試験仕様書、チラシを 1 冊にまとめる
import { run, publish } from './lib.mjs';
run('pdf', ['combine', 'word/spec.pdf', 'cad/gate.pdf', 'grid/spec-summary.pdf', 'grid/spec-tests.pdf', 'design/flyer.pdf', '--out', 'pdf/bundle-raw.pdf'], { label: '5 つの PDF を 1 冊に結合する' });
run('pdf', ['edit', 'pdf/bundle-raw.pdf', '--out', 'pdf/tooru-bundle.pdf', '--title', 'TOORU documents (fictional)', '--author', 'ArtCraft CLI demo'], { label: '文書情報を書き込む' });
run('pdf', ['info', 'pdf/tooru-bundle.pdf'], { label: 'ページ数などの情報を JSON で確認する', quiet: false });
run('pdf', ['extract', 'pdf/tooru-bundle.pdf', '--pages', '1-2', '--out', 'pdf/spec-and-drawing.pdf'], { label: '仕様書と図面だけを抜き出す' });
run('pdf', ['audit', 'pdf/tooru-bundle.pdf'], { label: '偽の墨消しがないか検査する', quiet: false });
const pages = 6;
for (let i = 1; i <= pages; i++) run('pdf', ['render', 'pdf/tooru-bundle.pdf', '--page', String(i), '--dpi', '60', '--out', `pdf/page-${i}.png`], { label: i === 1 ? 'ページを PNG にする' : undefined });
for (let i = 1; i <= pages; i++) publish(`pdf/page-${i}.png`, `pdf-page-${i}.png`);
