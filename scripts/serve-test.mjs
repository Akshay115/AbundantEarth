import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Deterministic foreground static server for browser tests, not a production server.
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(400).end(); return; }
    let status = 200;
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      await stat(path);
    } catch { path = resolve(root, '404.html'); status = 404; }
    const bytes = await readFile(path);
    response.writeHead(status, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    response.end(bytes);
  } catch { response.writeHead(400).end('Bad request'); }
}).listen(4322, '127.0.0.1', () => console.log('Static browser-test server: http://127.0.0.1:4322'));
