const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function setupSocketAuth(io) {
  io.use((socket, next) => {
    const { token, senderType, roomId } = socket.handshake.auth;
    console.log(`[SocketAuth] Handshake: senderType=${senderType}, token=${token ? 'Verified(Length ' + token.length + ')' : 'Missing'}`);

    if (!token) {
      console.error('[SocketAuth] No token provided');
      return next(new Error('Authentication token required'));
    }

    const db = socket.db;
    if (!db) {
      console.error('[SocketAuth] socket.db is missing!');
      return next(new Error('Internal server error'));
    }

    if (senderType === 'host') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(`[SocketAuth] Decoded: ${JSON.stringify(decoded)}`);

        db.getHostById(decoded.id, (err, host) => {
          if (err) {
            console.error('[SocketAuth] DB Error:', err);
            return next(new Error('Database error'));
          }
          if (!host) {
            console.error('[SocketAuth] Host not found for ID:', decoded.id);
            return next(new Error('Host not found'));
          }
          console.log(`[SocketAuth] Authenticated Host: ${host.name} (${host.id})`);
          socket.userId = host.id;
          socket.nickname = host.name;
          socket.senderType = 'host';
          next();
        });
      } catch (err) {
        console.error('[SocketAuth] Verification Failed:', err.message);
        next(new Error('Token verification failed'));
      }
    } else {
      // Guest logic omitted for brevity but logs added if needed
      // ... existing guest logic ...
      db.getParticipantByToken(token, (err, participant) => {
        if (err || !participant) {
          console.error('[SocketAuth] Invalid guest token');
          return next(new Error('Invalid guest token'));
        }
        socket.participantId = participant.id;
        socket.roomId = participant.room_id;
        socket.nickname = participant.nickname;
        socket.senderType = 'guest';
        next();
      });
    }
  });
}

module.exports = setupSocketAuth;
