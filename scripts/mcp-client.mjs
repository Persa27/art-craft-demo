// stdio の MCP サーバー(各 ArtCraft CLI の `mcp` サブコマンド)にツール呼び出しを順に送る小さなクライアント
import { spawn } from 'node:child_process';

export async function mcpSession(exe, args, calls) {
  const p = spawn(exe, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', id = 0;
  const waiting = new Map();
  p.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      if (msg.id != null && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
    }
  });
  let errText = '';
  p.stderr.on('data', (d) => { errText += d; });
  // サーバーが先に終了したら(接続できなかったときなど)、待っている呼び出しを失敗させる
  p.on('exit', () => { for (const res of waiting.values()) res({ error: { message: errText.trim() || 'MCP server exited' } }); waiting.clear(); });
  p.stdin.on('error', () => {});
  const req = (method, params) => new Promise((res) => { const n = ++id; waiting.set(n, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); });
  const init = await req('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'art-craft-demo', version: '1' } });
  if (init.error) { p.kill(); throw new Error(init.error.message); }
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const out = [];
  for (const [name, a] of calls) {
    const r = await req('tools/call', { name, arguments: a });
    const text = r.result?.content?.map((c) => c.text).join('') ?? JSON.stringify(r.error);
    if (r.error || r.result?.isError) throw new Error(`${name}: ${text}`);
    out.push(text);
  }
  p.stdin.end(); p.kill();
  return out;
}
