import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  if (message.sender_type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
          {message.original_text}
        </span>
      </div>
    );
  }

  // 번역문 표시 조건: 내 메시지이거나, 상대방(게스트/호스트) 메시지일 때
  // (시스템 메시지가 아닌 경우에만 이 컴포넌트가 렌더링됨)
  const showTranslation = message.translated_text && true;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
        {!isOwn && (
          <p className="text-xs text-slate-400 mb-1 ml-1 flex items-center gap-1">
            {message.sender_type === 'discord' && <span className="text-[#5865F2] font-bold">Discord</span>}
            <span>{message.senderName || message.nickname || (message.sender_type === 'host' ? '호스트' : '게스트')}</span>
          </p>
        )}

        <div className={`rounded-2xl ${isOwn
          ? 'bg-blue-600 rounded-br-md'
          : 'bg-slate-700 rounded-bl-md'
          }`}>
          {(message.sender_type === 'guest' || message.sender_type === 'discord') && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-sm leading-relaxed">{message.original_text}</p>
            </div>
          )}

          {message.sender_type === 'host' && isOwn && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-sm leading-relaxed">{message.original_text}</p>
            </div>
          )}

          {message.sender_type === 'host' && !isOwn && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-sm leading-relaxed">{message.original_text}</p>
            </div>
          )}

          {message.original_language && (
            <div className="px-4 text-xs text-slate-400">
              {message.original_language === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English'}
            </div>
          )}

          {showTranslation && (
            <>
              <div className="border-t border-white/10 mx-4 mt-2 pt-2">
                <p className="text-sm leading-relaxed italic text-slate-200">
                  {message.translated_text}
                </p>
              </div>

              <div className="flex justify-end px-4 pb-2 pt-1">
                <button
                  onClick={() => handleCopy(message.translated_text)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>
            </>
          )}

          {!showTranslation && (
            <div className="flex justify-end px-4 pb-2 pt-1">
              <span className="text-xs text-slate-400">
                {formatTime(message.created_at)}
              </span>
            </div>
          )}
        </div>

        {showTranslation && (
          <p className="text-xs text-slate-400 mt-1 text-right mr-1">
            {formatTime(message.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
