import { useEffect, useRef } from 'react';
import { MicOff, Pin, User, Volume2 } from 'lucide-react';

export default function ParticipantTile({
  user,
  videoTrack,
  audioTrack,
  displayName = 'Participant',
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  isPinned = false,
  onPin,
  avatar,
}) {
  const containerRef = useRef(null);
  const activeTrack = videoTrack || user?.videoTrack;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (activeTrack && !isVideoOff) {
      try {
        activeTrack.play(container);
      } catch (err) {
        console.error('Error playing video track:', err);
      }
    }

    return () => {
      if (activeTrack) {
        try {
          activeTrack.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [activeTrack, isVideoOff]);

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-dusk-900 shadow-md transition-all duration-200 ${
        isSpeaking ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-dusk-900' : 'ring-1 ring-white/10'
      }`}
    >
      {/* Video Stream Element */}
      <div
        ref={containerRef}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isVideoOff || !activeTrack ? 'hidden' : 'block'
        } ${isLocal ? 'scale-x-[-1]' : ''}`}
      />

      {/* Video Off Fallback Avatar */}
      {(isVideoOff || !activeTrack) && (
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-marigold-600 to-marigold-400 text-2xl font-bold text-white shadow-lg ring-4 ring-white/10">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase() || <User size={32} />
            )}
          </div>
          <span className="text-sm font-medium text-white/90">{displayName}</span>
        </div>
      )}

      {/* Top Overlay: Spotlight Pin */}
      {onPin && (
        <button
          onClick={onPin}
          title={isPinned ? 'Unpin' : 'Pin to main view'}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isPinned
              ? 'bg-marigold-500 text-white opacity-100'
              : 'bg-black/40 text-white/80 opacity-0 hover:bg-black/60 group-hover:opacity-100'
          }`}
        >
          <Pin size={14} className={isPinned ? 'rotate-45' : ''} />
        </button>
      )}

      {/* Bottom Overlay: Participant Name & Status */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
          {isSpeaking && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Volume2 size={13} className="animate-pulse" />
            </span>
          )}
          <span className="max-w-[140px] truncate sm:max-w-[200px]">
            {displayName} {isLocal ? '(You)' : ''}
          </span>
        </div>

        {isMuted && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/90 text-white backdrop-blur-md">
            <MicOff size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
