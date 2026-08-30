import { useState, useRef, useEffect } from 'react';
import { X, Send, Users, MessageSquare, Mic, MicOff, Video, VideoOff, ShieldCheck } from 'lucide-react';

export default function MeetingChat({
  isOpen,
  onClose,
  activeTab = 'chat', // 'chat' | 'participants'
  onChangeTab,
  messages = [],
  onSendMessage,
  currentUser,
  participants = [],
  isLocalMuted,
  isLocalVideoOff,
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <aside className="flex h-full w-80 sm:w-96 flex-col rounded-3xl border border-white/10 bg-dusk-900/95 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Sidebar Header & Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
          <button
            onClick={() => onChangeTab('chat')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-marigold-500 text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>Chat</span>
          </button>
          <button
            onClick={() => onChangeTab('participants')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'participants'
                ? 'bg-marigold-500 text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>People ({participants.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tab 1: Live In-Meeting Chat */}
      {activeTab === 'chat' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-white/40">
                <MessageSquare size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation with attendees</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id || msg.isMe;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-1">
                      <span className="font-medium text-white/80">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        isMe
                          ? 'bg-marigold-500 text-white rounded-br-none'
                          : 'bg-white/10 text-white/95 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Send a message to everyone..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-marigold-500 text-white hover:bg-marigold-600 disabled:opacity-40 disabled:hover:bg-marigold-500"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Participants List */}
      {activeTab === 'participants' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            In this meeting ({participants.length})
          </p>

          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-white/5 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold-500/20 text-marigold-400 font-bold text-sm">
                  {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {p.name} {p.isLocal ? '(You)' : ''}
                    </p>
                    {p.isHost && (
                      <span className="flex items-center gap-0.5 rounded bg-marigold-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-marigold-400">
                        <ShieldCheck size={10} /> Host
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50">{p.role || 'Participant'}</p>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-2 text-white/60">
                {(p.isLocal ? isLocalMuted : p.isMuted) ? (
                  <MicOff size={14} className="text-rose-400" />
                ) : (
                  <Mic size={14} className="text-emerald-400" />
                )}
                {(p.isLocal ? isLocalVideoOff : p.isVideoOff) ? (
                  <VideoOff size={14} className="text-rose-400" />
                ) : (
                  <Video size={14} className="text-sky-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
