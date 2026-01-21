// 최소한의 HTTP 서버 테스트
const http = require('http');

console.log('Starting minimal server...');

const server = http.createServer((req, res) => {
  console.log('REQUEST RECEIVED:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK\n');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on 0.0.0.0:3000 (IPv4 and IPv6)');
});

server.on('connection', (socket) => {
  console.log('TCP CONNECTION established');
});

server.on('error', (err) => {
  console.error('SERVER ERROR:', err);
});
