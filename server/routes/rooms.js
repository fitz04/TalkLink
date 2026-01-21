const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.get('db');
  db.getChatRooms((err, rooms) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    res.json({ rooms: rooms || [] });
  });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '채팅방 이름이 필요합니다' });
  }
  
  const db = req.app.get('db');
  const inviteCode = uuidv4().substring(0, 8).toUpperCase();
  
  db.createChatRoom(name, inviteCode, (err, room) => {
    if (err) return res.status(500).json({ error: '채팅방 생성 실패' });
    res.json({ room });
  });
});

router.get('/:id', (req, res) => {
  const db = req.app.get('db');
  
  db.getChatRoomById(req.params.id, (err, room) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    if (!room) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다' });
    }
    
    db.getParticipantsByRoom(room.id, (err, participants) => {
      if (err) return res.status(500).json({ error: '데이터베이스 오류' });
      res.json({ room, participants: participants || [] });
    });
  });
});

router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  
  db.deleteChatRoom(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: '채팅방 삭제 실패' });
    res.json({ success: true });
  });
});

router.get('/invite/:code', (req, res) => {
  const db = req.app.get('db');
  
  db.getChatRoomByInviteCode(req.params.code, (err, room) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    if (!room) {
      return res.status(404).json({ error: '유효하지 않은 초대 코드입니다' });
    }
    res.json({ room });
  });
});

router.post('/:id/join', (req, res) => {
  const { nickname } = req.body;
  const db = req.app.get('db');
  
  if (!nickname) {
    return res.status(400).json({ error: '닉네임이 필요합니다' });
  }
  
  db.getChatRoomById(req.params.id, (err, room) => {
    if (err) return res.status(500).json({ error: '데이터베이스 오류' });
    if (!room) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다' });
    }
    
    const token = uuidv4();
    db.createParticipant(room.id, nickname, token, 'en', (err, participant) => {
      if (err) return res.status(500).json({ error: '참여자 생성 실패' });
      
      res.json({
        participant: {
          id: participant.id,
          nickname: participant.nickname,
          token: participant.token,
          room_name: participant.room_name
        }
      });
    });
  });
});

module.exports = router;
