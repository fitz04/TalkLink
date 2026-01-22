const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.get('db');

  db.getAllSettings((err, settings) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });

    const safeSettings = { ...settings };
    // API 키는 보안상 필터링하지만 모델 설정은 노출
    delete safeSettings.openrouter_api_key;
    delete safeSettings.tavily_api_key;
    delete safeSettings.exa_api_key;

    // 모델 설정이 없으면 기본값 제공 (client 편의성)
    if (!safeSettings.openrouter_model) {
      safeSettings.openrouter_model = 'openai/gpt-4o-mini';
    }

    res.json({ settings: safeSettings });
  });
});

router.put('/', (req, res) => {
  const db = req.app.get('db');
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: '설정 키가 필요합니다' });
  }

  if (key.includes('api_key')) {
    return res.status(400).json({ error: 'API 키는 개별 엔드포인트를 통해 설정하세요' });
  }

  db.setSetting(key, value, (err) => {
    if (err) return res.status(500).json({ error: '설정 저장 실패' });
    res.json({ success: true });
  });
});

router.put('/api-key', (req, res) => {
  const db = req.app.get('db');
  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({ error: 'provider와 apiKey가 필요합니다' });
  }

  const validProviders = ['openrouter', 'tavily', 'exa'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: '유효하지 않은 provider입니다' });
  }

  db.setSetting(`${provider}_api_key`, apiKey, (err) => {
    if (err) return res.status(500).json({ error: 'API 키 저장 실패' });
    res.json({ success: true });
  });
});

router.get('/api-keys', (req, res) => {
  const db = req.app.get('db');

  db.getSetting('openrouter_api_key', (err, openrouter) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });

    db.getSetting('tavily_api_key', (err, tavily) => {
      if (err) return res.status(500).json({ error: '데이터베이스 오류' });

      db.getSetting('exa_api_key', (err, exa) => {
        if (err) return res.status(500).json({ error: '데이터베이스 오류' });

        res.json({
          keys: {
            openrouter: !!openrouter,
            tavily: !!tavily,
            exa: !!exa
          }
        });
      });
    });
  });
});

router.get('/profile', (req, res) => {
  const db = req.app.get('db');
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

    db.getHostByEmail(decoded.email, (err, host) => {
      if (err) return res.status(500).json({ error: '데이터베이스 오류' });
      if (!host) {
        return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
      }

      res.json({ profile: JSON.parse(host.profile || '{}') });
    });
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
});

router.put('/profile', (req, res) => {
  const db = req.app.get('db');
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

    db.getHostByEmail(decoded.email, (err, host) => {
      if (err) return res.status(500).json({ error: '데이터베이스 오류' });
      if (!host) {
        return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
      }

      const profile = JSON.stringify(req.body.profile || {});
      db.run('UPDATE host SET profile = ? WHERE id = ?', [profile, host.id], (err) => {
        if (err) return res.status(500).json({ error: '프로필 업데이트 실패' });
        res.json({ success: true, profile: req.body.profile });
      });
    });
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
});

module.exports = router;
