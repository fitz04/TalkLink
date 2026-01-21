import { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, X, ExternalLink, Copy, CheckCircle, Loader2 } from 'lucide-react';
import * as api from '../../lib/api';

export default function AssistantPanel({ isOpen, onClose, roomId }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatResults, setChatResults] = useState([]);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && roomId && searchQuery.trim()) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !roomId) return;

    setLoading(true);
    try {
      const res = await api.assistant.search(searchQuery, roomId);
      setSearchResults(res.web_results || []);
      setChatResults(res.chat_results || []);
      setSuggestedReply(res.suggested_reply || '');
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [suggestedReply]);

  const handleUseReply = () => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('useAssistantReply', { detail: suggestedReply }));
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-400" size={18} />
          <span className="font-medium">AI 어시스턴트</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          웹 검색
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          이전 대화
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="검색어를 입력하세요..."
                className="w-full px-3 py-2 pl-9 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'search' && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-400 hover:underline flex items-center gap-1"
                >
                  {result.title}
                  <ExternalLink size={12} />
                </a>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {result.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && chatResults.length > 0 && (
          <div className="space-y-3">
            {chatResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">
                    {result.date} - {result.room}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {result.preview}
                </p>
              </div>
            ))}
          </div>
        )}

        {suggestedReply && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-400 flex items-center gap-1">
                <Sparkles size={14} />
                제안 답변
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="복사"
                >
                  {copied ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {suggestedReply}
              </p>
            </div>
            <button
              onClick={handleUseReply}
              className="w-full mt-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors"
            >
              이 답변 사용하기
            </button>
          </div>
        )}

        {!loading && !searchResults.length && !chatResults.length && !suggestedReply && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">정보가 필요할 때</p>
            <p className="text-xs mt-1">검색해서 답변을 받아보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
