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

function setupChatHandler(io) {
  io.on('connection', (socket) => {
    const { senderType } = socket;

    socket.on('join_room', ({ roomId: targetRoomId }) => {
      socket.db.getChatRoomById(targetRoomId, (err, room) => {
        if (err || !room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        socket.join(`room_${targetRoomId}`);
        socket.roomId = targetRoomId;

        socket.db.getMessagesByRoom(targetRoomId, 100, (err, messages) => {
          if (err) messages = [];
          socket.emit('room_history', { room, messages: messages || [] });
        });

        socket.to(`room_${targetRoomId}`).emit('user_joined', {
          nickname: socket.nickname,
          senderType: socket.senderType
        });
      });
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(`room_${roomId}`);
      socket.to(`room_${roomId}`).emit('user_left', {
        nickname: socket.nickname
      });
    });

    socket.on('send_message', async ({ text, tone }) => {
      if (!text || !socket.roomId) {
        socket.emit('error', { message: 'Invalid message' });
        return;
      }

      socket.emit('typing', { nickname: socket.nickname, isTyping: true });

      const result = await translateText(socket.db, text, tone || 'professional');

      socket.emit('typing', { nickname: socket.nickname, isTyping: false });

      let translation = result.translation;
      let detectedLanguage = result.detected_language;
      let assistantSuggestion = result.assistant;

      if (result.error) {
        console.warn('Translation failed, sending original message only:', result.error);
        translation = null;
        detectedLanguage = 'unknown'; // or auto-detect locally
        // Optionally emit warning to user, but don't block
        socket.emit('error', { message: 'Translation unavailable: ' + result.error });
      }

      socket.db.createMessage(
        socket.roomId,
        socket.senderType,
        text,
        result.translation,
        result.detected_language,
        tone || 'professional',
        socket.senderType === 'guest' ? socket.participantId : null,
        (err, message) => {
          if (err || !message) {
            console.error('Failed to save message or message is null', err);
            socket.emit('error', { message: 'Failed to save message' });
            return;
          }

          message.nickname = socket.nickname;

          io.to(`room_${socket.roomId}`).emit('new_message', message);

          if (result.assistant?.should_search) {
            io.to(`room_${socket.roomId}`).emit('assistant_suggestion', {
              shouldSearch: true,
              reason: result.assistant.reason,
              suggestedQuery: result.assistant.suggested_query
            });
          }
        }
      );
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(`room_${roomId}`).emit('typing', {
        nickname: socket.nickname,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.to(`room_${socket.roomId}`).emit('user_left', {
          nickname: socket.nickname
        });
      }
    });
  });
}

module.exports = setupChatHandler;
