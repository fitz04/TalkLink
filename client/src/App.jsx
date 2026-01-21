import { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ChatRoom from './components/Chat/ChatRoom';
import Login from './components/Layout/Login';
import EmailMode from './components/Email/EmailMode';
import ProposalMode from './components/Proposal/ProposalMode';
import SettingsPanel from './components/Settings/SettingsPanel';
import AssistantPanel from './components/Chat/AssistantPanel';
import { useSocket } from './hooks/useSocket';

export const AppContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [currentMode, setCurrentMode] = useState('chat'); // 'chat', 'email', 'proposal'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('talklink_user');
    const savedToken = localStorage.getItem('talklink_token');
    const savedIsGuest = localStorage.getItem('talklink_is_guest') === 'true';

    if (savedIsGuest && savedToken) {
      const savedParticipant = JSON.parse(localStorage.getItem('talklink_participant') || '{}');
      setIsGuest(true);
      setParticipant(savedParticipant);
      setUser({ name: savedParticipant.nickname });
    } else if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setApiKeysConfigured(data.keys?.openrouter || false);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (user && !isGuest) {
      fetch('/api/rooms')
        .then(res => res.json())
        .then(data => setRooms(data.rooms || []))
        .catch(console.error);
    }
  }, [user, isGuest]);

  const handleLogin = (userData, token, isGuestMode = false) => {
    if (isGuestMode) {
      localStorage.setItem('talklink_is_guest', 'true');
    } else {
      localStorage.removeItem('talklink_is_guest');
    }
    setUser(userData);
    setIsGuest(isGuestMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('talklink_user');
    localStorage.removeItem('talklink_token');
    localStorage.removeItem('talklink_is_guest');
    localStorage.removeItem('talklink_participant');
    localStorage.removeItem('talklink_room_id');
    setUser(null);
    setIsGuest(false);
    setParticipant(null);
    setCurrentRoom(null);
  };

  const handleSelectRoom = (room) => {
    if (isGuest) {
      const savedRoomId = localStorage.getItem('talklink_room_id');
      if (savedRoomId && parseInt(savedRoomId) === room.id) {
        setCurrentRoom({ ...room, id: parseInt(savedRoomId) });
      }
    } else {
      setCurrentRoom(room);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setCurrentMode('chat');
  };

  const handleOpenEmail = () => {
    setCurrentMode('email');
    setCurrentRoom(null);
  };

  const handleOpenProposal = () => {
    setCurrentMode('proposal');
    setCurrentRoom(null);
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleOpenAssistant = () => {
    setAssistantOpen(true);
  };

  const handleCloseAssistant = () => {
    setAssistantOpen(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={{
      user,
      currentRoom,
      setCurrentRoom,
      isGuest,
      participant,
      rooms,
      setRooms,
      apiKeysConfigured,
      currentMode,
      setCurrentMode,
      settingsOpen,
      setSettingsOpen,
      handleSelectRoom,
      handleLeaveRoom,
      handleLogout,
      handleOpenEmail,
      handleOpenProposal,
      handleOpenSettings,
      handleCloseSettings,
      handleOpenAssistant,
      handleCloseAssistant
    }}>
      <div className="flex h-screen bg-slate-900">
        {!isGuest && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            {currentRoom ? (
              <>
                <ChatRoom room={currentRoom} />
                <AssistantPanel
                  isOpen={assistantOpen}
                  onClose={handleCloseAssistant}
                  roomId={currentRoom.id}
                />
              </>
            ) : currentMode === 'email' ? (
              <EmailMode />
            ) : currentMode === 'proposal' ? (
              <ProposalMode />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">TalkLink에 오신 것을 환영합니다</h2>
                  <p>채팅방을 선택하거나 새 채팅방을 만들어보세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {settingsOpen && <SettingsPanel />}
      </div>
    </AppContext.Provider>
  );
}

export default App;
