import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { Settings, Search, Bell, Sparkles } from 'lucide-react';

export default function Header() {
  const { currentRoom, isGuest, apiKeysConfigured, handleOpenSettings, handleOpenAssistant } = useContext(AppContext);
  const [showApiWarning, setShowApiWarning] = useState(false);

  useEffect(() => {
    if (!apiKeysConfigured) {
      const warningShown = localStorage.getItem('api_warning_shown');
      if (!warningShown) {
        setShowApiWarning(true);
        localStorage.setItem('api_warning_shown', 'true');
      }
    }
  }, [apiKeysConfigured]);

  if (isGuest) {
    return (
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-blue-400">TalkLink</h1>
          <span className="text-slate-400">|</span>
          <span className="text-sm">{currentRoom?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
          게스트 모드
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-blue-400">TalkLink</h1>
        {currentRoom && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-sm">{currentRoom.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showApiWarning && !apiKeysConfigured && (
          <button
            onClick={handleOpenSettings}
            className="text-amber-400 text-sm bg-amber-400/10 px-3 py-1 rounded-full hover:bg-amber-400/20 transition-colors"
          >
            ⚠️ API 키 설정 필요
          </button>
        )}
        {currentRoom && (
          <button
            onClick={handleOpenAssistant}
            className="p-2 hover:bg-slate-700 rounded-lg text-amber-400 transition-colors"
            title="AI 어시스턴트"
          >
            <Sparkles size={20} />
          </button>
        )}
        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
          <Bell size={20} />
        </button>
        <button
          onClick={handleOpenSettings}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
