import { useState, useEffect } from 'react';
import { X, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { integrations } from '../../lib/api';

export default function IntegrationSettings({ isOpen, onClose, roomId }) {
    const [botToken, setBotToken] = useState('');
    const [channelId, setChannelId] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (isOpen && roomId) {
            loadSettings();
        }
    }, [isOpen, roomId]);

    const loadSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await integrations.getDiscord(roomId);
            setBotToken(data.botToken || '');
            setChannelId(data.channelId || '');
            setIsActive(data.isActive || false);
        } catch (err) {
            console.error(err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (isActive && (!botToken || !channelId)) {
                throw new Error('활성화하려면 Bot Token과 Channel ID가 필요합니다.');
            }

            await integrations.updateDiscord(roomId, {
                botToken,
                channelId,
                isActive
            });
            setSuccess('설정이 저장되었습니다.');
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            console.error(err);
            setError(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-[#5865F2]">Discord</span> 연동 설정 (Beta)
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <RefreshCw className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Toggle */}
                            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <div>
                                    <h3 className="text-white font-medium">Discord 연동 활성화 (양방향)</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        활성화하면 TalkLink와 Discord 채널 간 메시지가 실시간 동기화됩니다.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            {/* Fields */}
                            <div className={`space-y-4 transition-opacity ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Bot Token
                                    </label>
                                    <input
                                        type="password"
                                        value={botToken}
                                        onChange={(e) => setBotToken(e.target.value)}
                                        placeholder="MTE..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent placeholder-slate-600"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Discord Developer Portal에서 생성한 봇의 토큰을 입력하세요.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Channel ID
                                    </label>
                                    <input
                                        type="text"
                                        value={channelId}
                                        onChange={(e) => setChannelId(e.target.value)}
                                        placeholder="1234567890..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent placeholder-slate-600 font-mono"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        연동할 디스코드 채널 우클릭 {'>'} 'ID 복사' (개발자 모드 켜져 있어야 함)
                                    </p>
                                </div>
                            </div>

                            {/* Logs/Status Area (Success/Error) */}
                            {error && (
                                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors mr-3"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <RefreshCw className="animate-spin" size={18} />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    설정 저장
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
