import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

const TONES = [
  { value: 'professional', label: '전문적', icon: '👔' },
  { value: 'friendly', label: '친근한', icon: '😊' },
  { value: 'negotiation', label: '협상', icon: '💪' },
  { value: 'update', label: '진행보고', icon: '📊' },
  { value: 'issue', label: '문제해결', icon: '🔧' },
];

export default function MessageInput({ onSend, isGuest }) {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('professional');
  const [sending, setSending] = useState(false);
  const [showToneSelector, setShowToneSelector] = useState(false);

  useEffect(() => {
    const savedTone = localStorage.getItem('talklink_tone');
    if (savedTone) {
      setTone(savedTone);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    await onSend(text.trim(), tone);
    setText('');
    setSending(false);
    
    localStorage.setItem('talklink_tone', tone);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-slate-700 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {!isGuest && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToneSelector(!showToneSelector)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
              title="톤 선택"
            >
              {TONES.find(t => t.value === tone)?.icon} {TONES.find(t => t.value === tone)?.label}
            </button>
            
            {showToneSelector && (
              <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                {TONES.map(toneOption => (
                  <button
                    key={toneOption.value}
                    type="button"
                    onClick={() => {
                      setTone(toneOption.value);
                      setShowToneSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                      tone === toneOption.value ? 'bg-blue-600/30 text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    <span>{toneOption.icon}</span>
                    <span>{toneOption.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGuest ? "영어로 메시지를 입력하세요..." : "메시지를 입력하세요..."}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none min-h-[44px] max-h-32"
          rows={1}
          disabled={sending}
        />
        
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {sending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      
      {!isGuest && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      )}
    </div>
  );
}
