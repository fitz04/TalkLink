const express = require('express');
const router = express.Router();

router.get('/:roomId', (req, res) => {
  const db = req.app.get('db');
  const { limit = 100 } = req.query;
  
  db.getMessagesByRoom(req.params.roomId, parseInt(limit), (err, messages) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    res.json({ messages: messages || [] });
  });
});

router.post('/:roomId', (req, res) => {
  const db = req.app.get('db');
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: '메시지 내용이 필요합니다' });
  }
  
  db.createMessage(
    req.params.roomId,
    'host',
    text,
    null,
    null,
    null,
    null,
    (err, message) => {
      if (err) return res.status(500).json({ error: '메시지 생성 실패' });
      
      req.app.get('io').to(`room_${req.params.roomId}`).emit('new_message', message);
      res.json({ message });
    }
  );
});

module.exports = router;
