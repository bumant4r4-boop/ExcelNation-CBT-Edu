/**
 * ExcelNation CBT Edu — Online Server
 * Sync multi-perangkat + sajikan aplikasi web
 *
 * Jalankan:  node server.js
 * Buka:      http://IP-laptop:8080
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'store.json');
const TEACHER_HASH = 'e71528abf228cf68f827c130d65e94fd788e99d23d4934b30d7ce48e58b3fea4'; // XC1EL

/** @type {Map<string, {v:any, ts:number}>} */
const store = new Map();
let version = 0;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function load() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const j = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    version = j.version || 0;
    if (j.data && typeof j.data === 'object') {
      Object.entries(j.data).forEach(([k, e]) => {
        if (e && typeof e === 'object' && 'ts' in e) store.set(k, { v: e.v, ts: e.ts });
      });
    }
    console.log(`[data] loaded ${store.size} keys, v=${version}`);
  } catch (e) {
    console.error('[data] load failed', e.message);
  }
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}
function save() {
  try {
    ensureDir(path.dirname(DATA_FILE));
    const data = {};
    store.forEach((e, k) => { data[k] = e; });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ version, data }));
  } catch (e) {
    console.error('[data] save failed', e.message);
  }
}

function setKey(k, val, ts) {
  const prev = store.get(k);
  const t = typeof ts === 'number' ? ts : Date.now();
  if (prev && prev.ts > t) return false;
  store.set(k, { v: val, ts: t });
  version += 1;
  scheduleSave();
  return true;
}

function isTeacher(req) {
  return (req.headers['x-teacher'] || '') === TEACHER_HASH;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 25 * 1024 * 1024) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, code, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-teacher, x-nis',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...(extraHeaders || {})
  });
  res.end(body);
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
  })[ext] || 'application/octet-stream';
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  // block data folder
  if (rel.startsWith('/data')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA fallback
    const idx = path.join(ROOT, 'index.html');
    if (fs.existsSync(idx)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      fs.createReadStream(idx).pipe(res);
      return;
    }
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, {
    'Content-Type': contentType(file),
    'Cache-Control': rel.endsWith('.html') ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(file).pipe(res);
}

async function handleApi(req, res, url) {
  const p = url.pathname;

  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  // GET /api/ping
  if (p === '/api/ping' && req.method === 'GET') {
    return send(res, 200, { app: 'excelnation', now: Date.now(), v: version, keys: store.size });
  }

  // GET /api/changes?since=
  if (p === '/api/changes' && req.method === 'GET') {
    const since = Number(url.searchParams.get('since') || 0) || 0;
    const changes = [];
    // Return all keys newer than client's knowledge using version watermark
    // Client sends since=version; we return entries and current v
    // Simple approach: if since < version, send all store (filtered if needed)
    store.forEach((e, k) => {
      // Hide answer keys from pure student pulls unless teacher
      if (k.startsWith('key:') && !isTeacher(req)) return;
      changes.push({ k, val: e.v, ts: e.ts });
    });
    return send(res, 200, { now: Date.now(), v: version, changes: since >= version ? [] : changes });
  }

  // POST /api/batch
  if (p === '/api/batch' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) {
      return send(res, 400, { error: 'JSON tidak valid' });
    }
    const items = Array.isArray(body.items) ? body.items : [];
    let n = 0;
    for (const it of items) {
      if (!it || typeof it.k !== 'string') continue;
      // Students may not overwrite keys
      if (String(it.k).startsWith('key:') && !isTeacher(req)) continue;
      if (setKey(it.k, it.val, it.ts)) n++;
    }
    return send(res, 200, { ok: true, applied: n, v: version });
  }

  // POST /api/unlock — siswa buka paket soal dengan kode ujian
  if (p === '/api/unlock' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) {
      return send(res, 400, { error: 'JSON tidak valid' });
    }
    const id = body.id;
    const code = String(body.code || '').trim().toUpperCase();
    if (!id || !code) return send(res, 400, { error: 'id/code wajib' });

    const cfg = store.get('cfg:' + id);
    const qs = store.get('qs:' + id);
    if (!cfg || !cfg.v || !qs || !qs.v) {
      return send(res, 404, { error: 'Ujian tidak ditemukan' });
    }
    const expect = String(cfg.v.code || '').trim().toUpperCase();
    if (expect && expect !== code) {
      return send(res, 403, { error: 'Kode salah' });
    }
    return send(res, 200, { ok: true, qs: qs.v });
  }

  // GET /api/health
  if (p === '/api/health') {
    return send(res, 200, { ok: true, uptime: process.uptime(), version, keys: store.size });
  }

  return send(res, 404, { error: 'API tidak ditemukan' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url.pathname);
  } catch (e) {
    console.error(e);
    try { send(res, 500, { error: 'Server error' }); } catch (_) {}
  }
});

load();
server.listen(PORT, HOST, () => {
  const nets = require('os').networkInterfaces();
  const ips = [];
  Object.values(nets).forEach((list) => {
    (list || []).forEach((n) => {
      if (n.family === 'IPv4' && !n.internal) ips.push(n.address);
    });
  });
  console.log('');
  console.log('  ExcelNation CBT Edu — ONLINE');
  console.log('  -----------------------------');
  console.log(`  Lokal : http://127.0.0.1:${PORT}`);
  ips.forEach((ip) => console.log(`  Jaringan: http://${ip}:${PORT}`));
  console.log('');
  console.log('  Guru  : panel guru → kode akses XC1EL');
  console.log('  Siswa : pilih nama → password ExcelNation123');
  console.log('  Data  : disimpan di folder data/store.json');
  console.log('');
});

process.on('SIGINT', () => { save(); process.exit(0); });
process.on('SIGTERM', () => { save(); process.exit(0); });
