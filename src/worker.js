// 動画と音声に Range リクエスト(206)を返す。Safari の再生とシークに必要
export default {
  async fetch(request, env) {
    const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
    if (!asset.ok) return asset;
    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');
    const body = await asset.arrayBuffer();
    const size = body.byteLength;
    const head = request.method === 'HEAD';
    const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
    if (!m || (m[1] === '' && m[2] === '')) {
      headers.set('Content-Length', String(size));
      return new Response(head ? null : body, { status: 200, headers });
    }
    let start;
    let end;
    if (m[1] === '') {
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end) {
      headers.set('Content-Range', `bytes */${size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(head ? null : body.slice(start, end + 1), { status: 206, headers });
  },
};
