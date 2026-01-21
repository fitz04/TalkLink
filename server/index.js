require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const translateRoutes = require('./routes/translate');
const settingsRoutes = require('./routes/settings');
const emailRoutes = require('./routes/email');
const proposalRoutes = require('./routes/proposal');

// ============== 로깅 설정 ==============
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, `talklink-${new Date().toISOString().split('T')[0]}.log`);

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = JSON.stringify({ timestamp, level, message, ...data });

  // 파일에 쓰기
  fs.appendFileSync(logFile, logData + '\n');

  // 콘솔 출력
  const colors = {
    INFO: '\x1b[32m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    DEBUG: '\x1b[36m',
    RESET: '\x1b[0m'
  };
  console.log(`${colors[level] || ''}[${level}]${colors.RESET} ${message}`, Object.keys(data).length ? data : '');
}

// ============== Express 앱 설정 ==============
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Request 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log('INFO', `${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

app.set('io', io);
app.set('db', db);

app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

// ============== 라우트 ==============
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/proposal', proposalRoutes);
app.use('/api/assistant', require('./routes/assistant'));

// SPA 라우트
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
});

// ============== 에러 핸들러 ==============
app.use((err, req, res, next) => {
  log('ERROR', 'Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ error: 'Internal server error' });
});

// ============== Socket.io 설정 ==============
io.use((socket, next) => {
  socket.db = db;
  log('DEBUG', 'Socket connected', { socketId: socket.id });
  next();
});

require('./socket/auth')(io);
require('./socket/chatHandler')(io);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

log('INFO', 'Starting TalkLink server...', { host: HOST, port: PORT });

server.listen(PORT, HOST, () => {
  log('INFO', 'Server started successfully', {
    http: `http://${HOST}:${PORT}`,
    ws: `ws://${HOST}:${PORT}`,
    api: `http://${HOST}:${PORT}/api`
  });

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 TalkLink Server Started                               ║
║  ─────────────────────────────────────────────────────────║
║  HTTP:    http://${HOST}:${PORT}                           ║
║  WebSocket: ws://${HOST}:${PORT}                           ║
║  API:     http://${HOST}:${PORT}/api                       ║
║  Logs:    ${LOG_DIR}
╚═══════════════════════════════════════════════════════════╝
  `);
});

// ============== Graceful Shutdown ==============
process.on('SIGTERM', () => {
  log('WARN', 'SIGTERM received, shutting down...');
  server.close(() => {
    log('INFO', 'Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('WARN', 'SIGINT received, shutting down...');
  server.close(() => {
    log('INFO', 'Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  log('ERROR', 'Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('ERROR', 'Unhandled rejection', { reason: String(reason) });
});
