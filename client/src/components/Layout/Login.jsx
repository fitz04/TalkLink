import { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { MessageCircle, Copy, Check } from 'lucide-react';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/setup';
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, name };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다');
      }
      
      localStorage.setItem('talklink_token', data.token);
      localStorage.setItem('talklink_user', JSON.stringify(data.host));
      onLogin(data.host, data.token, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`/api/rooms/invite/${inviteCode.toUpperCase()}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '유효하지 않은 초대 코드입니다');
      }
      
      const joinRes = await fetch(`/api/rooms/${data.room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      
      const joinData = await joinRes.json();
      
      if (!joinRes.ok) {
        throw new Error(joinData.error || '참여에 실패했습니다');
      }
      
      localStorage.setItem('talklink_participant', JSON.stringify(joinData.participant));
      localStorage.setItem('talklink_token', joinData.participant.token);
      localStorage.setItem('talklink_room_id', data.room.id);
      onLogin({ name: joinData.participant.nickname }, joinData.participant.token, true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'guest') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">TalkLink</h1>
            <p className="text-slate-400">게스트로 참여하기</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">초대 코드</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="예: ABC12345"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 uppercase tracking-wider"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">닉네임</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="사용할 이름을 입력하세요"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '참여 중...' : '채팅방 참여'}
              </button>
            </form>
            
            <button
              onClick={() => setMode('login')}
              className="w-full mt-4 text-slate-400 hover:text-slate-300"
            >
              호스트로 로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">TalkLink</h1>
          <p className="text-slate-400">실시간 번역 채팅 플랫폼</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('setup')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mode === 'setup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              회원가입
            </button>
          </div>
          
          <form onSubmit={handleHostSubmit} className="space-y-4">
            {mode === 'setup' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
                  required={mode === 'setup'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '처리 중...' : (mode === 'login' ? '로그인' : '회원가입')}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm mb-3">초대받은 게스트이신가요?</p>
            <button
              onClick={() => setMode('guest')}
              className="w-full py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300"
            >
              게스트로 참여하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
