// ============================================
// 디버깅용 최소 서버 - 문제 파악용
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';

console.log('🔧 Debug Server Starting...');
console.log(`   PID: ${process.pid}`);

// 정적 파일Serve
function serveStatic(filePath, contentType) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ data, contentType });
    });
  });
}

// HTTP 서버
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${url}`);
  
  try {
    // API 엔드포인트
    if (url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp, pid: process.pid }));
      return;
    }
    
    if (url === '/api/settings') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ keys: { openrouter: false } }));
      return;
    }
    
    // 정적 파일 (SPA)
    const clientDist = path.join(__dirname, '../client/dist');
    
    if (url === '/' || url === '/index.html') {
      const { data } = await serveStatic(path.join(clientDist, 'index.html'), 'text/html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
      return;
    }
    
    // CSS/JS 파일
    const filePath = path.join(clientDist, url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(url);
      const contentType = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html'
      }[ext] || 'text/plain';
      
      const { data } = await serveStatic(filePath, contentType);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Error: ' + err.message);
  }
});

// 서버 시작
server.listen(PORT, HOST, () => {
  console.log(`✅ Debug Server Running!`);
  console.log(`   URL: http://${HOST}:${PORT}`);
  console.log(`   Health: http://${HOST}:${PORT}/api/health`);
  console.log(`   API Settings: http://${HOST}:${PORT}/api/settings`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// 에러 핸들링
server.on('error', (err) => {
  console.error(`[SERVER ERROR] ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[UNCAUGHT] ${err.message}`);
  console.error(err.stack);
});
