const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

router.post('/polish', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.json({ polished: '' });
  }

  const db = req.app.get('db');
  const apiKey = db.getSetting('openrouter_api_key');

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenRouter API 키가 설정되지 않았습니다' });
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: `You are a professional business communication expert.
Transform the input into a polished business email in English.

Rules:
- Professional and courteous tone
- Clear structure: Greeting - Body - Closing
- Keep technical terms unchanged
- Improve clarity and professionalism while preserving the original intent

Respond ONLY with the polished email, nothing else.`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const polished = response.choices[0]?.message?.content?.trim() || '';

    // Save to history
    db.saveEmailHistory(text, polished, 'polish', (err) => {
      if (err) console.error('Failed to save email history:', err);
    });

    res.json({ polished });
  } catch (error) {
    console.error('Email polish error:', error);
    res.status(500).json({ error: '이메일 다듬기 중 오류가 발생했습니다' });
  }
});

router.post('/summarize', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.json({ summary: '', action_items: '', intentions: '' });
  }

  const db = req.app.get('db');
  const apiKey = db.getSetting('openrouter_api_key');

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenRouter API 키가 설정되지 않았습니다' });
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: `You are a professional assistant helping a Korean freelancer.
Analyze the English email and provide:

## 핵심 요약 (3줄 이내)
- Point 1
- Point 2
- Point 3

## Action Items
- [ ] Task 1
- [ ] Task 2

## 숨은 의도/뉘앙스 (있는 경우)
- 분석 내용

Respond ONLY with a JSON object in this format:
{
  "summary": "3-5 sentences summary in Korean",
  "action_items": "action items in Korean",
  "intentions": "hidden intentions if any, otherwise empty string"
}`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';

    let summary = '', actionItems = '', intentions = '';

    try {
      const parsed = JSON.parse(content);
      summary = parsed.summary || '';
      actionItems = parsed.action_items || '';
      intentions = parsed.intentions || '';
    } catch (e) {
      // If JSON parsing fails, try to parse manually
      const summaryMatch = content.match(/"summary":\s*"([^"]*)"/s);
      const actionsMatch = content.match(/"action_items":\s*"([^"]*)"/s);
      const intentionsMatch = content.match(/"intentions":\s*"([^"]*)"/s);

      summary = summaryMatch ? summaryMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : content;
      actionItems = actionsMatch ? actionsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
      intentions = intentionsMatch ? intentionsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
    }

    // Save to history
    db.saveEmailHistory(text, JSON.stringify({ summary, actionItems, intentions }), 'summarize', (err) => {
      if (err) console.error('Failed to save email history:', err);
    });

    res.json({ summary, action_items: actionItems, intentions });
  } catch (error) {
    console.error('Email summarize error:', error);
    res.status(500).json({ error: '이메일 요약 중 오류가 발생했습니다' });
  }
});

router.get('/history', (req, res) => {
  const db = req.app.get('db');
  const limit = parseInt(req.query.limit) || 20;

  db.getEmailHistory(limit, (err, history) => {
    if (err) return res.status(500).json({ error: '히스토리 조회 실패' });
    res.json({ history: history || [] });
  });
});

module.exports = router;
