import { useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Copy, Sparkles, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TONES = [
  { value: 'professional', label: '전문적' },
  { value: 'friendly', label: '친근한' },
  { value: 'formal', label: '격식체' },
  { value: 'concise', label: '간결한' }
];

export default function EmailMode() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [copied, setCopied] = useState(false);

  const { translate, polishEmail, summarizeEmail, translating, error } = useTranslation();

  const handlePolish = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      setMode('polish');
      const result = await polishEmail(inputText);
      setOutputText(result.result);
      setSummary(null);
    } catch (err) {
      console.error('Polish error:', err);
    }
  }, [inputText, polishEmail]);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      setMode('summarize');
      const result = await summarizeEmail(inputText);
      setOutputText('');
      setSummary({
        summary: result.summary,
        actionItems: result.actionItems,
        intentions: result.intentions
      });
    } catch (err) {
      console.error('Summarize error:', err);
    }
  }, [inputText, summarizeEmail]);

  const handleCopy = useCallback(() => {
    const textToCopy = summary
      ? `=== 요약 ===\n${summary.summary}\n\n=== 액션 아이템 ===\n${summary.actionItems}\n\n${summary.intentions ? `=== 숨은 의도 ===\n${summary.intentions}` : ''}`
      : outputText;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText, summary]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setSummary(null);
    setMode(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} className="text-blue-400" />
          이메일 모드
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          영어 이메일을 다듬거나 한국어로 요약합니다
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 border-r border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">입력 텍스트</span>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="px-3 py-1 rounded-lg bg-slate-700 border border-slate-600 text-sm focus:outline-none focus:border-blue-500"
            >
              {TONES.map(tone => (
                <option key={tone.value} value={tone.value}>{tone.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="영어 이메일을 붙여넣으세요..."
            className="flex-1 w-full p-4 rounded-lg bg-slate-800 border border-slate-700 resize-none focus:outline-none focus:border-blue-500 font-mono text-sm"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePolish}
              disabled={translating || !inputText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles size={16} />
              영어로 다듬기
            </button>
            <button
              onClick={handleSummarize}
              disabled={translating || !inputText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              한국어 요약
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">
              {mode === 'summarize' ? '요약 결과' : '처리 결과'}
            </span>
            {outputText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? '복사됨' : '복사'}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {translating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="animate-spin">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <span>처리 중...</span>
              </div>
            </div>
          )}

          {!translating && mode === 'summarize' && summary && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-sm font-medium text-amber-400 mb-2">핵심 요약</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{summary.summary}</p>
              </div>

              {summary.actionItems && (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-medium text-green-400 mb-2">Action Items</h3>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{summary.actionItems}</div>
                </div>
              )}

              {summary.intentions && (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-medium text-purple-400 mb-2">숨은 의도/뉘앙스</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{summary.intentions}</p>
                </div>
              )}
            </div>
          )}

          {!translating && outputText && mode === 'polish' && (
            <textarea
              value={outputText}
              readOnly
              className="flex-1 w-full p-4 rounded-lg bg-slate-800 border border-slate-700 resize-none focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          )}

          {!translating && !outputText && !summary && (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>왼쪽에 이메일을 붙여넣으세요</p>
                <p className="text-sm mt-1">다듬기 또는 요약 결과를 여기서 확인합니다</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
