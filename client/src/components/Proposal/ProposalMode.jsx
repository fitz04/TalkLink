import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import * as api from '../../lib/api';
import { Copy, CheckCircle, AlertCircle, FileText, Sparkles, FolderOpen } from 'lucide-react';

export default function ProposalMode() {
  const { rooms } = useContext(AppContext);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [proposal, setProposal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Pre-select rooms with recent activity
    if (rooms.length > 0 && selectedRooms.length === 0) {
      const recentRooms = rooms
        .filter(r => r.message_count > 0)
        .slice(0, 2)
        .map(r => r.id);
      setSelectedRooms(recentRooms);
    }
  }, [rooms]);

  const toggleRoom = (roomId) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleGenerate = async () => {
    if (selectedRooms.length === 0) {
      setError('최소 하나의 채팅방을 선택해야 합니다');
      return;
    }

    setGenerating(true);
    setError(null);
    setProposal('');

    try {
      const res = await api.proposal.generate(selectedRooms, instructions);

      if (!res.ok) {
        throw new Error(res.error || '제안서 생성 실패');
      }

      setProposal(res.proposal);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSelectedRooms([]);
    setInstructions('');
    setProposal('');
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} className="text-amber-400" />
          제안서 생성
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          채팅 기록을 기반으로 전문적인 제안서를 작성합니다
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <FolderOpen size={14} />
              참조할 대화 선택
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {rooms.length === 0 ? (
                <p className="text-xs text-slate-500">채팅방이 없습니다</p>
              ) : (
                rooms.map(room => (
                  <label
                    key={room.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRooms.includes(room.id)
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRooms.includes(room.id)}
                      onChange={() => toggleRoom(room.id)}
                      className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{room.name}</p>
                      <p className="text-xs text-slate-500">
                        {room.message_count}개 메시지
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-2">추가 지시사항</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="예: 예산 범위를 강조하고, 빠른 제출을 약속해주세요"
              className="flex-1 w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 resize-none focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="p-4 border-t border-slate-700 space-y-2">
            {error && (
              <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating || selectedRooms.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  제안서 생성
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={generating}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">생성된 제안서</span>
            {proposal && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? '복사됨' : '복사'}
              </button>
            )}
          </div>

          {generating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="animate-spin">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                </div>
                <span>대화를 분석하고 제안서를 작성하는 중...</span>
              </div>
            </div>
          )}

          {proposal && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 whitespace-pre-wrap font-mono text-sm">
                {proposal}
              </div>
            </div>
          )}

          {!generating && !proposal && (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>왼쪽에서 채팅방을 선택하고</p>
                <p className="text-sm mt-1">추가 지시사항을 입력한 후</p>
                <p className="text-sm mt-1">제안서 생성을 클릭하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
