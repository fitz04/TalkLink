const OpenAI = require('openai');

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

async function translateText(db, text, tone = 'professional') {
    if (!text || text.trim().length === 0) {
        return { translation: '', detectedLanguage: null };
    }

    const apiKey = await new Promise((resolve) => {
        db.getSetting('openrouter_api_key', (err, value) => {
            resolve(value || process.env.OPENROUTER_API_KEY);
        });
    });

    if (!apiKey) {
        return { translation: null, error: 'API key not configured' };
    }

    const cacheKey = `${text.trim()}:${tone}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
        return { translation: cached, cached: true };
    }

    const model = await new Promise((resolve) => {
        db.getSetting('openrouter_model', (err, value) => {
            resolve(value || 'openai/gpt-4o-mini');
        });
    });

    try {
        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
        });

        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `You are a professional translator with 15 years of experience.

## Task 1: Translation
Translate the input text to the OPPOSITE language:
- If input is Korean → Translate to English
- If input is English → Translate to Korean
- IMPORTANT: Never return the same language as input. Always translate to the other language.
- Maintain professional business tone
- Keep technical terms unchanged: API, RAG, DSP, Latency, etc.
- Apply tone: ${tone}

## Task 2: Assistant Analysis
Analyze if additional information might help:
- Technical terms the host might not know
- Topics discussed in previous conversations
- Specific technical requirements from client

## Output Format (JSON)
{
  "translation": "translated text here",
  "detected_language": "ko" or "en",
  "assistant": {
    "should_search": true/false,
    "reason": "why search might help (in Korean)",
    "suggested_query": "search query if should_search is true"
  }
}

Respond ONLY with valid JSON, nothing else.`
                },
                { role: 'user', content: text }
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const content = response.choices[0]?.message?.content || '';

        let result;
        try {
            result = JSON.parse(content);
        } catch {
            result = { translation: content, detected_language: 'unknown', assistant: { should_search: false } };
        }

        if (result.translation) {
            translationCache.set(cacheKey, result.translation);
        }

        return result;
    } catch (error) {
        console.error('Translation error:', error);
        return { translation: null, error: error.message };
    }
}

module.exports = {
    translateText
};
