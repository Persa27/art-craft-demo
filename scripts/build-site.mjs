// 公開用の site/index.html を生成する
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, BUILD, scenario } from './lib.mjs';
import { tools, stages, categories, lessons } from './tools.mjs';

const { spec, people } = scenario();
const log = JSON.parse(fs.readFileSync(path.join(BUILD, 'commands.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const buildAbs = BUILD.split(path.sep).join('/');

const quote = (a) => {
  a = a.split(buildAbs + '/').join('');
  return /^[\w@%+=:,./-]+$/.test(a) ? a : `'${a}'`;
};
// 長い --cmd の連続は途中を省略して表示する。コピーでは全文を渡す
function commandText(e) {
  const exe = `${e.tool}craft-cli`;
  const parts = e.args.map(quote);
  const full = [exe, ...parts].join(' ');
  if (full.length <= 260) return { shown: full, full };
  const out = [exe]; let flags = 0, hidden = 0, i = 0;
  while (i < parts.length) {
    if (parts[i] === '--cmd') { flags++; if (flags > 2) { hidden++; i += 2; continue; } out.push(parts[i], parts[i + 1].length > 110 ? parts[i + 1].slice(0, 107) + "…'" : parts[i + 1]); i += 2; continue; }
    if (hidden && !out.includes('__H')) out.push('__H');
    out.push(parts[i].length > 110 ? parts[i].slice(0, 107) + "…'" : parts[i]); i++;
  }
  const shown = out.join(' ').replace('__H', `… ほか ${hidden} 個の --cmd …`);
  return { shown, full };
}
const secs = (ms) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} 秒`);

function media(m, t) {
  const a = (f) => `assets/${f}`;
  if (m.type === 'image') return `<figure class="shot${m.tall ? ' tall' : ''}${m.plain ? ' plain' : ''}${m.crop ? ' crop' : ''}"><img src="${a(m.src)}" alt="${esc(m.alt)}" loading="lazy"></figure>`;
  if (m.type === 'gallery') return `<div class="gallery${m.tall ? ' tall' : ''}">${m.items.map(([f, c]) => `<figure><img src="${a(f)}" alt="${esc(c)}" loading="lazy"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>`;
  if (m.type === 'pair') return `<div class="pair">${m.items.map(([f, c]) => `<figure><img src="${a(f)}" alt="${esc(c)}" loading="lazy"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>`;
  if (m.type === 'row') return `<div class="row${m.dark ? ' dark' : ''}">${m.items.map(([f, c]) => `<figure><img src="${a(f)}" alt="${esc(c)}" loading="lazy"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>`;
  if (m.type === 'audio') return `<div class="sounds">${m.items.map(([f, c, d]) => `<div class="sound"><strong>${esc(c)}</strong><span>${esc(d)}</span><audio controls preload="none" src="${a(f)}"></audio></div>`).join('')}</div>`;
  return '';
}

function toolSection(t, i) {
  const st = stages[t.stage];
  const cmds = log.filter((e) => e.tool === t.key).slice(0, 4);
  const list = cmds.map((e) => {
    const c = commandText(e);
    return `<div class="cmd"><div class="cmd-head"><span>${esc(e.label)}</span><span class="cmd-meta">終了コード 0 / ${secs(e.ms)}</span><button type="button" class="copy" data-copy="${esc(c.full)}">コピー</button></div><pre tabindex="0"><code>${esc(c.shown)}</code></pre></div>`;
  }).join('');
  return `<section class="tool stage-${st.color}" id="${t.key}" data-cat="${t.cat}">
  <header class="tool-head">
    <span class="stop" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <div><p class="eyebrow">${st.name}の工程 / ${esc(t.kind)}</p><h3>${esc(t.name)}</h3></div>
    <p class="ver">v${t.version}<br>${t.cmdsLabel || 'コマンド'} ${t.cmds}</p>
  </header>
  <div class="tool-body">
    <div class="tool-text">
      <h4>何ができるか</h4><p>${esc(t.what)} ${esc(t.near)} に近い位置づけのツールです。</p>
      <h4>この案件で作ったもの</h4><p>${esc(t.made)}</p>
      <h4>対応形式</h4><p class="formats">${esc(t.formats)}</p>
      ${t.note ? `<p class="note${t.warn ? ' warn' : ''}"><strong>${t.warn ? '制約' : '補足'}</strong> ${esc(t.note)}</p>` : ''}
    </div>
    <div class="tool-media">${t.media.map((m) => media(m, t)).join('')}</div>
  </div>
  <div class="cmds"><h4>実際に実行したコマンド</h4>${list}</div>
</section>`;
}

const route = tools.map((t, i) => `<li class="stage-${stages[t.stage].color}" data-cat="${t.cat}"><a href="#${t.key}"><span class="dot" aria-hidden="true">${i + 1}</span><span class="rname">${esc(t.name.replace('Craft', ''))}</span><span class="rkind">${esc(t.kind)}</span></a></li>`).join('');
const stageLegend = Object.values(stages).map((s) => `<li class="stage-${s.color}"><i></i>${s.name}</li>`).join('');
const chips = categories.map(([k, n], i) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${i === 0}">${n}</button>`).join('');

const A = people[0], B = people[1];
const nearest = (p, t) => p.keys.reduce((b, c) => (Math.abs(c.t - t) < Math.abs(b.t - t) ? c : b));
const kA = nearest(A, A.tAuth + 0.05);
const guide = (kA.x / spec.width * 100).toFixed(2);
const total = log.reduce((s, e) => s + e.ms, 0);

const tpl = fs.readFileSync(path.join(ROOT, 'scripts', 'page.template.html'), 'utf8');
const page = tpl
  .replace('{{ROUTE}}', route).replace('{{LEGEND}}', stageLegend).replace('{{CHIPS}}', chips)
  .replace('{{TOOLS}}', tools.map(toolSection).join('\n'))
  .replace('{{LESSONS}}', lessons.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join(''))
  .replaceAll('{{GUIDE}}', guide)
  .replaceAll('{{T_OK}}', A.tAuth.toFixed(1)).replaceAll('{{T_NG}}', B.tAuth.toFixed(1))
  .replaceAll('{{X}}', Math.round(kA.x)).replaceAll('{{D}}', kA.d_m)
  .replaceAll('{{TOTAL}}', (total / 1000).toFixed(0)).replaceAll('{{NCMD}}', log.length);

fs.writeFileSync(path.join(ROOT, 'site', 'index.html'), `<!doctype html>\n<html lang="ja">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${page}\n</html>\n`);
console.log('site built', page.length);
