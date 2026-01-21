import { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { MessageCircle, Mail, FileText, Settings, LogOut, Plus } from 'lucide-react';

export default function Sidebar() {
  const { user, rooms, setRooms, currentRoom, handleSelectRoom, handleLogout, currentMode, setCurrentMode } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navigateTo = (mode) => {
    setCurrentMode(mode);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName })
      });

      const data = await res.json();
      console.log('Room creation response:', data);
      if (data.room) {
        console.log('Updating rooms with:', data.room);
        setRooms(prevRooms => {
          console.log('Previous rooms:', prevRooms);
          const newRooms = [...prevRooms, data.room];
          console.log('New rooms:', newRooms);
          return newRooms;
        });
        setShowModal(false);
        setNewRoomName('');
        handleSelectRoom(data.room);
        setCurrentMode('chat');
      } else {
        console.error('No room in response:', data);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">TalkLink</h1>
          <p className="text-sm text-slate-400 mt-1">실시간 번역 채팅</p>
        </div>

        <div className="p-4 border-b border-slate-700">
          <p className="text-sm text-slate-400">환영합니다</p>
          <p className="font-medium truncate">{user?.name}</p>
        </div>

        <nav className="flex-1 p-2">
          <div className="space-y-1">
            <button
              onClick={() => navigateTo('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentMode === 'chat'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700/50 text-slate-200'
                }`}
            >
              <MessageCircle size={20} />
              채팅방
            </button>
            <button
              onClick={() => navigateTo('email')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentMode === 'email'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700/50 text-slate-400'
                }`}
            >
              <Mail size={20} />
              이메일
            </button>
            <button
              onClick={() => navigateTo('proposal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentMode === 'proposal'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700/50 text-slate-400'
                }`}
            >
              <FileText size={20} />
              제안서
            </button>
            <button
              onClick={() => navigateTo('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentMode === 'settings'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-700/50 text-slate-400'
                }`}
            >
              <Settings size={20} />
              설정
            </button>
          </div>

          <div className="mt-6">
            <p className="px-3 text-xs text-slate-500 uppercase mb-2">채팅방 목록</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    handleSelectRoom(room);
                    setCurrentMode('chat');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentMode === 'chat' && currentRoom?.id === room.id
                    ? 'bg-slate-700 text-slate-200'
                    : 'hover:bg-slate-700/50 text-slate-300 text-sm'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="truncate">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-2 border-t border-slate-700">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white mb-2"
          >
            <Plus size={18} />
            새 채팅방
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/20 text-red-400"
          >
            <LogOut size={20} />
            로그아웃
          </button>
        </div>
      </aside>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">새 채팅방 만들기</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              placeholder="채팅방 이름 (예: 프로젝트 A - 클라이언트명)"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300"
              >
                취소
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${isCreating
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isCreating ? '생성 중...' : '만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
