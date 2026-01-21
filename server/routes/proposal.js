const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { room_ids, instructions, profile } = req.body;

  if (!room_ids || room_ids.length === 0) {
    return res.status(400).json({ error: '최소 하나의 채팅방을 선택해야 합니다' });
  }

  const db = req.app.get('db');
  const apiKey = db.getSetting('openrouter_api_key');

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenRouter API 키가 설정되지 않았습니다' });
  }

  try {
    // Get conversation history from all selected rooms
    let conversations = [];

    for (const roomId of room_ids) {
      const room = await new Promise((resolve, reject) => {
        db.getChatRoomById(roomId, (err, room) => {
          if (err) reject(err);
          else resolve(room);
        });
      });

      if (!room) continue;

      const messages = await new Promise((resolve, reject) => {
        db.getMessagesByRoom(roomId, 100, (err, messages) => {
          if (err) reject(err);
          else resolve(messages || []);
        });
      });

      const conversationText = messages
        .map(m => `[${m.sender_type}] ${m.original_text}`)
        .join('\n');

      conversations.push(`## 채팅방: ${room.name}\n${conversationText}`);
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: `You are an expert Upwork proposal writer.
Create a compelling proposal based on the conversation history and freelancer profile.

## Freelancer Profile
${JSON.stringify(profile || {}, null, 2)}

## Additional Instructions
${instructions || 'なし'}

## Proposal Structure
1. Hook: Address client's specific need mentioned in conversation
2. Experience: Relevant skills and past work
3. Approach: How you'll tackle this project
4. Timeline & Budget: If discussed
5. Call to Action: Clear next step

Write in professional English, keep it concise but compelling.
Respond ONLY with the proposal text.`
        },
        {
          role: 'user',
          content: conversations.join('\n\n')
        }
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const proposal = response.choices[0]?.message?.content?.trim() || '';

    // Save to history
    db.saveProposalHistory(room_ids, instructions, proposal, (err) => {
      if (err) console.error('Failed to save proposal history:', err);
    });

    res.json({ proposal });
  } catch (error) {
    console.error('Proposal generate error:', error);
    res.status(500).json({ error: '제안서 생성 중 오류가 발생했습니다' });
  }
});

router.get('/history', (req, res) => {
  const db = req.app.get('db');

  db.getProposalHistory((err, history) => {
    if (err) return res.status(500).json({ error: '히스토리 조회 실패' });
    res.json({ history: history || [] });
  });
});

module.exports = router;
