const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

router.post('/setup', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: '이메일, 비밀번호, 이름이 필요합니다' });
  }
  
  const db = req.app.get('db');
  
  db.getHostByEmail(email, (err, existingHost) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    if (existingHost) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다' });
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    const profile = JSON.stringify({});
    
    db.createHost(email, passwordHash, name, profile, (err, host) => {
      if (err) return res.status(500).json({ error: '호스트 생성 실패' });
      
      const token = jwt.sign(
        { id: host.id, email: host.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        host: {
          id: host.id,
          email: host.email,
          name: host.name,
          profile: JSON.parse(host.profile || '{}')
        }
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다' });
  }
  
  const db = req.app.get('db');
  
  db.getHostByEmail(email, (err, host) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    
    if (!host || !bcrypt.compareSync(password, host.password_hash)) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
    }
    
    const token = jwt.sign(
      { id: host.id, email: host.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      host: {
        id: host.id,
        email: host.email,
        name: host.name,
        profile: JSON.parse(host.profile || '{}')
      }
    });
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = req.app.get('db');
    
    db.getHostById(decoded.id, (err, host) => {
      if (err) return res.status(500).json({ error: '데이터베이스 오류' });
      if (!host) {
        return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
      }
      
      res.json({
        host: {
          id: host.id,
          email: host.email,
          name: host.name,
          profile: JSON.parse(host.profile || '{}')
        }
      });
    });
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
});

module.exports = router;
