const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

class LRUCache {
  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

const translationCache = new LRUCache(1000, 3600000);

router.post('/', async (req, res) => {
  const { text, tone = 'professional' } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.json({ translation: '', detected_language: null });
  }
  
  const db = req.app.get('db');
  const apiKey = db.getSetting('openrouter_api_key');
  
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenRouter API 키가 설정되지 않았습니다' });
  }
  
  const cacheKey = `${text.trim()}:${tone}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return res.json({ translation: cached, cached: true });
  }
  
  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
    });
    
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the input text:
- Korean → English / English → Korean (auto-detect)
- Maintain professional business tone
- Keep technical terms unchanged
- Apply tone: ${tone}

Respond ONLY with the translated text, nothing else.`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    const translation = response.choices[0]?.message?.content?.trim() || '';
    
    if (translation) {
      translationCache.set(cacheKey, translation);
    }
    
    res.json({ translation, cached: false });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: '번역 중 오류가 발생했습니다' });
  }
});

router.post('/detect', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.json({ language: null, confidence: 0 });
  }
  
  const koreanPattern = /[가-힣]/;
  const englishPattern = /[a-zA-Z]/;
  
  const koreanCount = (text.match(/[가-힣]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
  const total = koreanCount + englishCount;
  
  if (total === 0) {
    return res.json({ language: 'unknown', confidence: 0 });
  }
  
  const koreanRatio = koreanCount / total;
  const language = koreanRatio > 0.5 ? 'ko' : 'en';
  const confidence = Math.max(koreanRatio, 1 - koreanRatio);
  
  res.json({ language, confidence: Math.round(confidence * 100) / 100 });
});

module.exports = router;
