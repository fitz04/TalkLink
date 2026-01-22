const OpenAI = require('openai');
const DiscordBotService = require('../services/discordBot');



const { translateText } = require('../services/translate');

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

          // Sync to Discord if integrated
          if (DiscordBotService && typeof DiscordBotService.sendMessageToDiscord === 'function') {
            DiscordBotService.sendMessageToDiscord(socket.roomId, translation || text, socket.nickname);
          }

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
