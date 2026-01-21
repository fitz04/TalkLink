import { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../App';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useSocket } from '../../hooks/useSocket';

export default function ChatRoom({ room }) {
  const { user, isGuest, participant, handleLeaveRoom } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [assistantSuggestion, setAssistantSuggestion] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = useSocket(room.id);

  useEffect(() => {
    if (!socket) return;

    // 방 변경 시 이전 메시지 초기화
    setMessages([]);

    socket.emit('join_room', { roomId: room.id });

    socket.on('room_history', ({ messages: history }) => {
      setMessages(history || []);
    });

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('typing', ({ nickname, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(nickname);
        } else {
          next.delete(nickname);
        }
        return next;
      });
    });

    socket.on('user_joined', ({ nickname }) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        sender_type: 'system',
        original_text: `${nickname}님이 입장했습니다`,
        created_at: new Date().toISOString()
      }]);
    });

    socket.on('user_left', ({ nickname }) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        sender_type: 'system',
        original_text: `${nickname}님이 퇴장했습니다`,
        created_at: new Date().toISOString()
      }]);
    });

    socket.on('assistant_suggestion', (suggestion) => {
      setAssistantSuggestion(suggestion);
    });

    return () => {
      socket.emit('leave_room', { roomId: room.id });
      socket.off('room_history');
      socket.off('new_message');
      socket.off('typing');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('assistant_suggestion');
    };
  }, [socket, room.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text, tone) => {
    if (socket && text.trim()) {
      socket.emit('send_message', { text, tone });
    }
  };

  const handleDismissSuggestion = () => {
    setAssistantSuggestion(null);
  };

  const handleAcceptSuggestion = () => {
    if (assistantSuggestion?.suggestedReply) {
      handleSendMessage(assistantSuggestion.suggestedReply);
      setAssistantSuggestion(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.sender_type !== 'system').map((message, index) => {
          // 내 메시지인지 판단:
          // - 호스트 모드: sender_type이 'host'이고, sender_id가 null이거나 내 user.id와 같으면 내 메시지
          // - 게스트 모드: sender_type이 'guest'이고, sender_id가 내 participant.id와 같으면 내 메시지
          let isOwn = false;
          if (!isGuest) {
            // 호스트 모드: host 타입의 메시지는 내 것 (현재 호스트가 1명이므로)
            isOwn = message.sender_type === 'host';
          } else {
            // 게스트 모드: 내 participant ID와 일치하면 내 것
            isOwn = message.sender_type === 'guest' && message.sender_id === participant?.id;
          }

          return (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwn={isOwn}
            />
          );
        })}

        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <span className="text-xs text-slate-400 ml-2">
              {Array.from(typingUsers).join(', ')} 입력 중...
            </span>
          </div>
        )}

        {assistantSuggestion && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <span className="text-amber-400 text-lg">💡</span>
              <div className="flex-1">
                <p className="text-amber-300 text-sm mb-2">{assistantSuggestion.reason}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptSuggestion}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded text-sm"
                  >
                    사용하기
                  </button>
                  <button
                    onClick={handleDismissSuggestion}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSendMessage} isGuest={isGuest} />
    </div>
  );
}

let messagesEndRef;
