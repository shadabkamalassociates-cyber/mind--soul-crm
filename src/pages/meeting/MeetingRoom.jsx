import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Maximize2, Minimize2, Radio, Sparkles, AlertCircle } from 'lucide-react';
import { useAgoraMeeting } from '../../hooks/useAgoraMeeting';
import MeetingLobby from '../../components/meeting/MeetingLobby';
import ParticipantTile from '../../components/meeting/ParticipantTile';
import MeetingControls from '../../components/meeting/MeetingControls';
import MeetingChat from '../../components/meeting/MeetingChat';
import { useJoinVirtualMeetingMutation } from '../../services/virtualMeetingService';

export default function MeetingRoom() {
  const { channelId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.user);
  const [joinVirtualMeeting] = useJoinVirtualMeetingMutation();

  const channelName = channelId || searchParams.get('channel') || 'soulsensei-general';
  const sessionTitle = location.state?.title || searchParams.get('title') || 'SoulSensei Live Meeting';

  const {
    isJoined,
    isJoining,
    isLeaving,
    error,
    isMuted,
    isVideoOff,
    isScreenSharing,
    remoteUsers,
    participantInfo,
    incomingMessages,
    speakingUsers,
    devices,
    selectedCameraId,
    selectedMicId,
    localAudioTrack,
    localVideoTrack,
    joinMeeting,
    leaveMeeting,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    switchCamera,
    switchMicrophone,
    sendChatMessage,
  } = useAgoraMeeting();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState('chat');
  const [pinnedUid, setPinnedUid] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);

  // In-call messages state
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'system',
      senderName: 'System',
      text: `Welcome to ${sessionTitle}! Agora HD Video Session is active.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync incoming real-time stream messages into chat log
  useEffect(() => {
    if (incomingMessages.length > 0) {
      setMessages((prev) => {
        const newOnes = incomingMessages.filter((im) => !prev.some((m) => m.id === im.id));
        if (newOnes.length === 0) return prev;
        return [...prev, ...newOnes];
      });
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [incomingMessages, isChatOpen]);

  // Timer while joined
  useEffect(() => {
    let timer;
    if (isJoined) {
      timer = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setMeetingDuration(0);
    }
    return () => clearInterval(timer);
  }, [isJoined]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(meetingDuration / 60);
    const secs = meetingDuration % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [meetingDuration]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Helper to resolve remote participant name
  const getParticipantDisplayName = (uid) => {
    if (participantInfo[uid]?.name) {
      return participantInfo[uid].name;
    }
    if (uid === 1001) return 'Admin (Host)';
    if (uid === 1002) return 'Expert';
    return `Participant ${String(uid)}`;
  };

  // Handle joining from lobby with backend token support & display name
  const handleJoinFromLobby = async ({ displayName, isMuted: lobbyMuted, isVideoOff: lobbyVideoOff }) => {
    try {
      let tokenToUse = location.state?.token || null;
      let actualChannel = location.state?.channelName || channelName;
      let appIdToUse = location.state?.appId || null;
      let uidToUse = location.state?.uid || (currentUser?.id ? Number(currentUser.id) || null : null);

      // If token wasn't pre-passed from create meeting, request token from backend
      if (!tokenToUse) {
        try {
          const res = await joinVirtualMeeting({ meetingId: channelName }).unwrap();
          if (res?.token) {
            tokenToUse = res.token;
            actualChannel = res.channelName || actualChannel;
            appIdToUse = res.appId || appIdToUse;
            uidToUse = res.uid || uidToUse;
          }
        } catch (backendErr) {
          console.warn('Backend join API skipped or failed, falling back to direct join:', backendErr);
        }
      }

      const effectiveName = displayName || currentUser?.name || (currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'expert' ? 'Expert' : 'Guest');
      const effectiveRole = currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'expert' ? 'Expert' : 'Participant';

      await joinMeeting({
        channelName: actualChannel,
        appId: appIdToUse,
        token: tokenToUse,
        uid: uidToUse,
        displayName: effectiveName,
        userRole: effectiveRole,
        initialMuted: lobbyMuted,
        initialVideoOff: lobbyVideoOff,
      });
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  // Leave and redirect
  const handleLeave = async () => {
    await leaveMeeting();
    if (currentUser?.role === 'expert') {
      navigate('/expert/meetings');
    } else if (currentUser?.role === 'admin') {
      navigate('/admin/meetings');
    } else {
      navigate('/');
    }
  };

  // Send real-time in-meeting message
  const handleSendMessage = async (text) => {
    const sentMsg = await sendChatMessage({
      text,
      senderName: currentUser?.name || (currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'expert' ? 'Expert' : 'You'),
      senderId: currentUser?.id || 'local-user',
    });
    setMessages((prev) => [...prev, { ...sentMsg, isMe: true }]);
  };

  // Side panel toggles
  const handleToggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsChatOpen(true);
      setIsParticipantsOpen(false);
      setActiveSideTab('chat');
      setUnreadCount(0);
    }
  };

  const handleToggleParticipants = () => {
    if (isParticipantsOpen) {
      setIsParticipantsOpen(false);
    } else {
      setIsParticipantsOpen(true);
      setIsChatOpen(false);
      setActiveSideTab('participants');
    }
  };

  // Build participants roster list with synchronized names
  const participantsList = useMemo(() => {
    const list = [
      {
        id: 'local',
        name: currentUser?.name || (currentUser?.role === 'admin' ? 'Admin (You)' : currentUser?.role === 'expert' ? 'Expert (You)' : 'You'),
        isLocal: true,
        isHost: currentUser?.role === 'expert' || currentUser?.role === 'admin',
        role: currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'expert' ? 'Expert' : 'Host',
      },
    ];

    remoteUsers.forEach((u) => {
      const info = participantInfo[u.uid];
      list.push({
        id: String(u.uid),
        name: info?.name || getParticipantDisplayName(u.uid),
        isLocal: false,
        isHost: info?.role === 'admin' || info?.role === 'expert' || u.uid === 1001,
        isMuted: !u.hasAudio,
        isVideoOff: !u.hasVideo,
        role: info?.role || (u.uid === 1001 ? 'Admin' : u.uid === 1002 ? 'Expert' : 'Attendee'),
      });
    });

    return list;
  }, [currentUser, remoteUsers, participantInfo]);

  // If not joined, show the Lobby screen
  if (!isJoined) {
    return (
      <MeetingLobby
        channelName={channelName}
        sessionTitle={sessionTitle}
        defaultName={currentUser?.name || (currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'expert' ? 'Expert' : 'Guest')}
        onJoin={handleJoinFromLobby}
        onCancel={() => navigate(-1)}
        devices={devices}
        selectedCameraId={selectedCameraId}
        selectedMicId={selectedMicId}
      />
    );
  }

  // Active Video Call View
  const totalCount = 1 + remoteUsers.length;
  const isSpotlightMode = !!pinnedUid || isScreenSharing;

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-dusk-950 text-white font-sans">
      {/* Top Header Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-dusk-900/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-marigold-500 to-marigold-600 text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white max-w-[220px] truncate sm:max-w-md">
              {sessionTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="font-mono text-marigold-400 font-semibold">{channelName.replace(/^cosmic_guru_/, '')}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Radio size={12} className="animate-pulse" /> Live ({formattedTimer})
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Main Call Stage + Sidebar */}
      <div className="relative flex flex-1 overflow-hidden p-4 gap-4">
        {/* Video Grid Stage */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-500/20 p-3 text-xs text-rose-300 border border-rose-500/30">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Grid Layouts */}
          <div className="flex-1 overflow-hidden">
            {isSpotlightMode ? (
              /* Spotlight / Screen Share Layout */
              <div className="flex h-full flex-col gap-4">
                {/* Main Spotlight Window */}
                <div className="flex-1 overflow-hidden">
                  {pinnedUid === 'local' || isScreenSharing ? (
                    <ParticipantTile
                      displayName={currentUser?.name || 'You'}
                      videoTrack={localVideoTrack}
                      audioTrack={localAudioTrack}
                      isLocal={true}
                      isMuted={isMuted}
                      isVideoOff={isVideoOff && !isScreenSharing}
                      isPinned={true}
                      onPin={() => setPinnedUid(null)}
                    />
                  ) : (
                    (() => {
                      const pinnedUser = remoteUsers.find((u) => u.uid === pinnedUid) || remoteUsers[0];
                      if (!pinnedUser) return null;
                      return (
                        <ParticipantTile
                          user={pinnedUser}
                          displayName={getParticipantDisplayName(pinnedUser.uid)}
                          videoTrack={pinnedUser.videoTrack}
                          audioTrack={pinnedUser.audioTrack}
                          isLocal={false}
                          isMuted={!pinnedUser.hasAudio}
                          isVideoOff={!pinnedUser.hasVideo}
                          isSpeaking={speakingUsers.has(pinnedUser.uid)}
                          isPinned={true}
                          onPin={() => setPinnedUid(null)}
                        />
                      );
                    })()
                  )}
                </div>

                {/* Filmstrip at Bottom */}
                <div className="flex h-32 shrink-0 gap-3 overflow-x-auto pb-1">
                  {/* Local tile in filmstrip if not pinned */}
                  {pinnedUid !== 'local' && !isScreenSharing && (
                    <div className="h-full w-48 shrink-0">
                      <ParticipantTile
                        displayName={currentUser?.name || 'You'}
                        videoTrack={localVideoTrack}
                        audioTrack={localAudioTrack}
                        isLocal={true}
                        isMuted={isMuted}
                        isVideoOff={isVideoOff}
                        onPin={() => setPinnedUid('local')}
                      />
                    </div>
                  )}
                  {/* Remote tiles in filmstrip */}
                  {remoteUsers
                    .filter((u) => u.uid !== pinnedUid)
                    .map((user) => (
                      <div key={user.uid} className="h-full w-48 shrink-0">
                        <ParticipantTile
                          user={user}
                          displayName={getParticipantDisplayName(user.uid)}
                          videoTrack={user.videoTrack}
                          audioTrack={user.audioTrack}
                          isLocal={false}
                          isMuted={!user.hasAudio}
                          isVideoOff={!user.hasVideo}
                          isSpeaking={speakingUsers.has(user.uid)}
                          onPin={() => setPinnedUid(user.uid)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Dynamic Gallery Grid Layout */
              <div
                className={`grid h-full w-full gap-4 ${
                  totalCount === 1
                    ? 'grid-cols-1 grid-rows-1'
                    : totalCount === 2
                    ? 'grid-cols-1 sm:grid-cols-2 grid-rows-1'
                    : totalCount <= 4
                    ? 'grid-cols-2 grid-rows-2'
                    : 'grid-cols-2 sm:grid-cols-3 grid-rows-2'
                }`}
              >
                {/* Local User Tile */}
                <ParticipantTile
                  displayName={currentUser?.name || 'You'}
                  videoTrack={localVideoTrack}
                  audioTrack={localAudioTrack}
                  isLocal={true}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  onPin={() => setPinnedUid('local')}
                />

                {/* Remote Participants */}
                {remoteUsers.map((user) => (
                  <ParticipantTile
                    key={user.uid}
                    user={user}
                    displayName={getParticipantDisplayName(user.uid)}
                    videoTrack={user.videoTrack}
                    audioTrack={user.audioTrack}
                    isLocal={false}
                    isMuted={!user.hasAudio}
                    isVideoOff={!user.hasVideo}
                    isSpeaking={speakingUsers.has(user.uid)}
                    onPin={() => setPinnedUid(user.uid)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* In-Call Live Chat & Participants Sidebar */}
        <MeetingChat
          isOpen={isChatOpen || isParticipantsOpen}
          onClose={() => {
            setIsChatOpen(false);
            setIsParticipantsOpen(false);
          }}
          activeTab={activeSideTab}
          onChangeTab={setActiveSideTab}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          participants={participantsList}
          isLocalMuted={isMuted}
          isLocalVideoOff={isVideoOff}
        />
      </div>

      {/* Bottom Meeting Control Bar */}
      <div className="shrink-0 p-4 pt-0">
        <MeetingControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          participantCount={totalCount}
          unreadCount={unreadCount}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          onLeaveCall={handleLeave}
          devices={devices}
          selectedCameraId={selectedCameraId}
          selectedMicId={selectedMicId}
          onSelectCamera={switchCamera}
          onSelectMic={switchMicrophone}
        />
      </div>
    </div>
  );
}
