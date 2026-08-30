import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  User,
} from 'lucide-react';
import { createLocalTracks } from '../../services/agoraService';

export default function MeetingLobby({
  channelName,
  sessionTitle = 'Online Consultation',
  defaultName = 'Guest',
  onJoin,
  onCancel,
  devices,
  selectedCameraId,
  selectedMicId,
}) {
  const [displayName, setDisplayName] = useState(defaultName);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const previewContainerRef = useRef(null);
  const previewTracksRef = useRef({ audioTrack: null, videoTrack: null });

  // Start local preview tracks
  useEffect(() => {
    let isCancelled = false;

    async function initPreview() {
      try {
        setPreviewError(null);
        const { audioTrack, videoTrack } = await createLocalTracks(
          selectedMicId ? { deviceId: selectedMicId } : {},
          selectedCameraId ? { deviceId: selectedCameraId } : {}
        );

        if (isCancelled) {
          audioTrack.close();
          videoTrack.close();
          return;
        }

        previewTracksRef.current = { audioTrack, videoTrack };

        if (previewContainerRef.current && videoActive) {
          videoTrack.play(previewContainerRef.current);
        }
      } catch (err) {
        console.warn('Lobby camera preview error:', err);
        setPreviewError('Unable to access camera or microphone. Please check browser permissions.');
      }
    }

    initPreview();

    return () => {
      isCancelled = true;
      if (previewTracksRef.current.audioTrack) {
        previewTracksRef.current.audioTrack.close();
      }
      if (previewTracksRef.current.videoTrack) {
        previewTracksRef.current.videoTrack.close();
      }
    };
  }, [selectedCameraId, selectedMicId]);

  const toggleMicPreview = () => {
    const next = !micActive;
    setMicActive(next);
    if (previewTracksRef.current.audioTrack) {
      previewTracksRef.current.audioTrack.setEnabled(next);
    }
  };

  const toggleVideoPreview = () => {
    const next = !videoActive;
    setVideoActive(next);
    if (previewTracksRef.current.videoTrack) {
      previewTracksRef.current.videoTrack.setEnabled(next);
      if (next && previewContainerRef.current) {
        previewTracksRef.current.videoTrack.play(previewContainerRef.current);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    // Stop lobby preview tracks before joining actual Agora RTC session
    if (previewTracksRef.current.audioTrack) {
      previewTracksRef.current.audioTrack.close();
      previewTracksRef.current.audioTrack = null;
    }
    if (previewTracksRef.current.videoTrack) {
      previewTracksRef.current.videoTrack.close();
      previewTracksRef.current.videoTrack = null;
    }

    onJoin({
      displayName: displayName.trim() || 'Attendee',
      isMuted: !micActive,
      isVideoOff: !videoActive,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-dusk-950 via-dusk-900 to-black p-4 text-white">
      <div className="w-full max-w-4xl">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Preview Box */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-dusk-900 shadow-2xl">
              {/* Video Preview */}
              <div
                ref={previewContainerRef}
                className={`h-full w-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  !videoActive || previewError ? 'hidden' : 'block'
                }`}
              />

              {/* Video Off Placeholder */}
              {(!videoActive || previewError) && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-marigold-600 to-marigold-400 text-3xl font-bold text-white shadow-xl ring-4 ring-white/10">
                    {displayName ? displayName.charAt(0).toUpperCase() : <User size={36} />}
                  </div>
                  <p className="text-sm text-white/70">
                    {previewError ? previewError : 'Camera is turned off'}
                  </p>
                </div>
              )}

              {/* Preview Floating Controls */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-black/60 px-4 py-2 backdrop-blur-md">
                <button
                  type="button"
                  onClick={toggleMicPreview}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    micActive
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                  title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micActive ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button
                  type="button"
                  onClick={toggleVideoPreview}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    videoActive
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                  title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Join Panel */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-marigold-400">
                <Sparkles size={14} /> Agora HD Video Room
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white">{sessionTitle}</h2>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                <span className="text-white/60">Meeting ID:</span>
                <span className="font-mono font-semibold text-marigold-400 select-all">{channelName.replace(/^cosmic_guru_/, '')}</span>
              </div>

              {/* User Display Name Input */}
              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-white/80">Your Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
                />
              </div>

              {/* Copy Invite Link & ID */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(channelName.replace(/^cosmic_guru_/, ''));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Copy size={13} />
                  <span>Copy ID</span>
                </button>
              </div>
            </div>

            {/* Join Action */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleJoin}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-marigold-500 to-marigold-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-marigold-500/25 hover:from-marigold-600 hover:to-marigold-700 active:scale-[0.98] transition-all"
              >
                Join Meeting Now
              </button>
              <p className="text-center text-[11px] text-white/40">
                Powered by Agora RTC Real-Time Engagement Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
