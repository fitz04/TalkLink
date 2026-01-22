import { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Settings, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPanel() {
  const { handleCloseSettings } = useContext(AppContext);
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [exaKey, setExaKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [showKeys, setShowKeys] = useState({ openrouter: false, tavily: false, exa: false });
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState(null);

  // 초기 설정 로드
  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.openrouter_model) {
          setSelectedModel(data.settings.openrouter_model);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveSetting = async (key, value) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });

      if (!res.ok) throw new Error('설정 저장 실패');

      setMessage({ type: 'success', text: '설정이 저장되었습니다' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSaveKey = async (provider, key) => {
    if (!key.trim()) return;

    setSaving(provider);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '저장에 실패했습니다');
      }

      setMessage({ type: 'success', text: `${provider.toUpperCase()} API 키가 저장되었습니다` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings size={20} />
            설정
          </h2>
          <button
            onClick={handleCloseSettings}
            className="text-slate-400 hover:text-slate-300"
          >
            닫기
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Lock size={16} />
              API Keys
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">OpenRouter API Key</label>
                  <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                    번역 필수
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  https://openrouter.ai 에서 확인
                </p>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.openrouter ? 'text' : 'password'}
                      value={openrouterKey}
                      onChange={e => setOpenrouterKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, openrouter: !prev.openrouter }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showKeys.openrouter ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey('openrouter', openrouterKey)}
                    disabled={saving === 'openrouter' || !openrouterKey.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
                  >
                    {saving === 'openrouter' ? '저장 중...' : '저장'}
                  </button>
                </div>

                <div className="border-t border-slate-600 pt-3">
                  <label className="block text-sm font-medium mb-2 text-slate-300">사용 모델 (Model)</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="openai/gpt-4o-mini">GPT-4o Mini (빠름/저렴)</option>
                      <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (균형)</option>
                      <option value="anthropic/claude-3-haiku">Claude 3 Haiku (자연스러움)</option>
                      <option value="openai/gpt-4o">GPT-4o (고성능)</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (최고 성능)</option>
                    </select>
                    <button
                      onClick={() => handleSaveSetting('openrouter_model', selectedModel)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm"
                    >
                      모델 저장
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Tavily API Key</label>
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    웹 검색 (선택)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  https://tavily.com 에서 확인
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.tavily ? 'text' : 'password'}
                      value={tavilyKey}
                      onChange={e => setTavilyKey(e.target.value)}
                      placeholder="tvly-..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, tavily: !prev.tavily }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showKeys.tavily ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey('tavily', tavilyKey)}
                    disabled={saving === 'tavily' || !tavilyKey.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
                  >
                    {saving === 'tavily' ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Exa API Key</label>
                  <span className="text-xs text-slate-500 bg-slate-600 px-2 py-1 rounded">
                    백업 옵션
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  https://exa.ai 에서 확인
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.exa ? 'text' : 'password'}
                      value={exaKey}
                      onChange={e => setExaKey(e.target.value)}
                      placeholder="..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, exa: !prev.exa }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showKeys.exa ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey('exa', exaKey)}
                    disabled={saving === 'exa' || !exaKey.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
                  >
                    {saving === 'exa' ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-3">상태</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg text-center bg-slate-700/50 text-slate-400">
                <p className="text-xs">번역</p>
                <p className="font-medium">설정 중...</p>
              </div>
              <div className="p-3 rounded-lg text-center bg-slate-700/50 text-slate-400">
                <p className="text-xs">웹 검색</p>
                <p className="font-medium">준비됨</p>
              </div>
              <div className="p-3 rounded-lg text-center bg-slate-700/50 text-slate-400">
                <p className="text-xs">AI 어시스턴트</p>
                <p className="font-medium">준비됨</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
