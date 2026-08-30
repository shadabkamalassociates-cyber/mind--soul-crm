import { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  PhoneOff,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

export default function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isChatOpen,
  isParticipantsOpen,
  participantCount = 1,
  unreadCount = 0,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  onLeaveCall,
  devices,
  selectedCameraId,
  selectedMicId,
  onSelectCamera,
  onSelectMic,
}) {
  const [showMicMenu, setShowMicMenu] = useState(false);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-dusk-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      {/* Left Area: Invite / Copy Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          title="Copy meeting invite link"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Link Copied' : 'Invite Link'}</span>
        </button>
      </div>

      {/* Center Media Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Audio Mic Button & Selector */}
        <div className="relative flex items-center">
          <button
            onClick={onToggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-xl font-medium transition-all ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute (Ctrl+D)' : 'Mute (Ctrl+D)'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={() => setShowMicMenu(!showMicMenu)}
            className="ml-0.5 flex h-12 w-5 items-center justify-center rounded-r-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ChevronUp size={14} />
          </button>

          {/* Mic dropdown */}
          {showMicMenu && (
            <div className="absolute bottom-14 left-0 z-50 w-64 rounded-xl border border-white/10 bg-dusk-950 p-2 shadow-2xl backdrop-blur-md">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Select Microphone
              </p>
              {devices?.microphones?.map((m) => (
                <button
                  key={m.deviceId}
                  onClick={() => {
                    onSelectMic(m.deviceId);
                    setShowMicMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                    selectedMicId === m.deviceId
                      ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{m.label || `Mic ${m.deviceId.slice(0, 5)}`}</span>
                  {selectedMicId === m.deviceId && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Camera Button & Selector */}
        <div className="relative flex items-center">
          <button
            onClick={onToggleCamera}
            className={`flex h-12 w-12 items-center justify-center rounded-xl font-medium transition-all ${
              isVideoOff
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isVideoOff ? 'Turn on camera (Ctrl+E)' : 'Turn off camera (Ctrl+E)'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button
            onClick={() => setShowCamMenu(!showCamMenu)}
            className="ml-0.5 flex h-12 w-5 items-center justify-center rounded-r-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ChevronUp size={14} />
          </button>

          {/* Camera dropdown */}
          {showCamMenu && (
            <div className="absolute bottom-14 left-0 z-50 w-64 rounded-xl border border-white/10 bg-dusk-950 p-2 shadow-2xl backdrop-blur-md">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Select Camera
              </p>
              {devices?.cameras?.map((c) => (
                <button
                  key={c.deviceId}
                  onClick={() => {
                    onSelectCamera(c.deviceId);
                    setShowCamMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                    selectedCameraId === c.deviceId
                      ? 'bg-sky-500/20 text-sky-300 font-medium'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{c.label || `Camera ${c.deviceId.slice(0, 5)}`}</span>
                  {selectedCameraId === c.deviceId && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
            isScreenSharing
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>

        {/* Leave Call Button */}
        <button
          onClick={onLeaveCall}
          className="flex h-12 items-center gap-2 rounded-xl bg-rose-600 px-4 font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 active:scale-95 transition-all"
          title="Leave Meeting"
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline text-xs uppercase tracking-wider">Leave</span>
        </button>
      </div>

      {/* Right Side Utilities: Chat, Participants, Settings */}
      <div className="flex items-center gap-2">
        {/* Participants Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
            isParticipantsOpen
              ? 'bg-marigold-500 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
          }`}
          title="Participants list"
        >
          <Users size={18} />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-dusk-800 text-[10px] font-bold text-white ring-2 ring-dusk-900">
            {participantCount}
          </span>
        </button>

        {/* In-Meeting Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
            isChatOpen
              ? 'bg-marigold-500 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
          }`}
          title="In-meeting Chat"
        >
          <MessageSquare size={18} />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-dusk-900">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
