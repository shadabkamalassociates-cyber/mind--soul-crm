import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  createAgoraClient,
  createLocalTracks,
  createScreenTrack,
  getConnectedDevices,
} from '../services/agoraService';
import { getAgoraAppId } from '../config/agora';

export function useAgoraMeeting() {
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localScreenTrackRef = useRef(null);
  const myProfileRef = useRef({ name: 'Guest', role: 'Participant', uid: null });

  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [remoteUsers, setRemoteUsers] = useState([]);
  const [participantInfo, setParticipantInfo] = useState({});
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [networkQuality, setNetworkQuality] = useState({ uplink: 0, downlink: 0 });

  const [devices, setDevices] = useState({
    cameras: [],
    microphones: [],
    playbackDevices: [],
  });
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [selectedMicId, setSelectedMicId] = useState('');

  // Load connected media devices
  const refreshDevices = useCallback(async () => {
    const devList = await getConnectedDevices();
    setDevices(devList);
    if (devList.cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(devList.cameras[0].deviceId);
    }
    if (devList.microphones.length > 0 && !selectedMicId) {
      setSelectedMicId(devList.microphones[0].deviceId);
    }
    return devList;
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices);
    };
  }, [refreshDevices]);

  // Send broadcast data stream message to channel
  const broadcastData = useCallback(async (data) => {
    const client = clientRef.current;
    if (!client) return;
    try {
      const msgStr = typeof data === 'string' ? data : JSON.stringify(data);
      await client.sendStreamMessage(msgStr);
    } catch (err) {
      console.warn('[Agora RTC] Error sending stream message:', err);
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback(
    async ({ text, senderName, senderId }) => {
      const messagePayload = {
        type: 'chat',
        id: String(Date.now() + Math.random().toString(36).substring(2, 6)),
        senderId: senderId || myProfileRef.current.uid || 'user',
        senderName: senderName || myProfileRef.current.name || 'You',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Broadcast to other participants
      await broadcastData(messagePayload);
      return messagePayload;
    },
    [broadcastData]
  );

  // Broadcast user info (name & role)
  const broadcastMyInfo = useCallback(async () => {
    const profile = myProfileRef.current;
    if (profile.uid) {
      await broadcastData({
        type: 'user_info',
        uid: profile.uid,
        name: profile.name,
        role: profile.role,
      });
    }
  }, [broadcastData]);

  // Join the channel
  const joinMeeting = useCallback(
    async ({
      channelName,
      appId: customAppId = null,
      uid = null,
      token = null,
      displayName = 'Guest',
      userRole = 'Participant',
      initialMuted = false,
      initialVideoOff = false,
    }) => {
      if (!channelName) {
        throw new Error('Channel name is required');
      }

      const appId = customAppId || getAgoraAppId();
      if (!appId) {
        throw new Error('Agora App ID is missing.');
      }

      setIsJoining(true);
      setError(null);

      try {
        const client = createAgoraClient();
        clientRef.current = client;

        // Remote user published track
        client.on('user-published', async (user, mediaType) => {
          console.log('[Agora RTC] Remote user published:', user.uid, mediaType);
          await client.subscribe(user, mediaType);

          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.play();
          }

          setRemoteUsers([...client.remoteUsers]);
          // Send our user info so the newly published user knows who we are
          broadcastMyInfo();
        });

        // Remote user unpublished track
        client.on('user-unpublished', (user, mediaType) => {
          console.log('[Agora RTC] Remote user unpublished:', user.uid, mediaType);
          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.stop();
          }
          setRemoteUsers([...client.remoteUsers]);
        });

        // Remote user joined
        client.on('user-joined', (user) => {
          console.log('[Agora RTC] Remote user joined channel:', user.uid);
          setRemoteUsers([...client.remoteUsers]);
          // Respond with our info
          broadcastMyInfo();
        });

        // Remote user left
        client.on('user-left', (user) => {
          console.log('[Agora RTC] Remote user left channel:', user.uid);
          setRemoteUsers([...client.remoteUsers]);
          setParticipantInfo((prev) => {
            const next = { ...prev };
            delete next[user.uid];
            return next;
          });
        });

        // In-call data stream messages (Chat & User Names)
        client.on('stream-message', (uid, data) => {
          try {
            let parsed;
            if (typeof data === 'string') {
              parsed = JSON.parse(data);
            } else if (data instanceof Uint8Array) {
              const str = new TextDecoder().decode(data);
              parsed = JSON.parse(str);
            } else {
              parsed = data;
            }

            if (!parsed || !parsed.type) return;

            if (parsed.type === 'user_info') {
              console.log('[Agora RTC] Received user_info for UID:', parsed.uid, parsed.name);
              setParticipantInfo((prev) => ({
                ...prev,
                [parsed.uid]: {
                  name: parsed.name,
                  role: parsed.role,
                },
              }));
            } else if (parsed.type === 'chat') {
              console.log('[Agora RTC] Received chat message from:', parsed.senderName, parsed.text);
              setIncomingMessages((prev) => {
                const exists = prev.some((m) => m.id === parsed.id);
                if (exists) return prev;
                return [...prev, { ...parsed, isMe: false }];
              });
            }
          } catch (e) {
            console.warn('[Agora RTC] Error parsing stream message:', e);
          }
        });

        // Volume indicator
        client.enableAudioVolumeIndicator();
        client.on('volume-indicator', (volumes) => {
          const speakers = new Set();
          volumes.forEach((v) => {
            if (v.level > 5) {
              speakers.add(v.uid);
            }
          });
          setSpeakingUsers(speakers);
        });

        // Network quality
        client.on('network-quality', (stats) => {
          setNetworkQuality({
            uplink: stats.uplinkNetworkQuality,
            downlink: stats.downlinkNetworkQuality,
          });
        });

        // Join Agora RTC Channel
        const actualUid = await client.join(appId, channelName, token || null, uid || null);

        myProfileRef.current = {
          uid: actualUid,
          name: displayName,
          role: userRole,
        };

        // Create local tracks
        const { audioTrack, videoTrack } = await createLocalTracks(
          selectedMicId ? { deviceId: selectedMicId } : {},
          selectedCameraId ? { deviceId: selectedCameraId } : {}
        );

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        if (initialMuted) {
          audioTrack.setEnabled(false);
          setIsMuted(true);
        } else {
          setIsMuted(false);
        }

        if (initialVideoOff) {
          videoTrack.setEnabled(false);
          setIsVideoOff(true);
        } else {
          setIsVideoOff(false);
        }

        // Publish local audio and video tracks
        await client.publish([audioTrack, videoTrack]);

        setIsJoined(true);

        // Broadcast our user name immediately after joining
        setTimeout(() => {
          broadcastMyInfo();
        }, 500);

        return { uid: actualUid, client, audioTrack, videoTrack };
      } catch (err) {
        console.error('Failed to join Agora meeting:', err);
        setError(err.message || 'Failed to join meeting');
        throw err;
      } finally {
        setIsJoining(false);
      }
    },
    [broadcastMyInfo, selectedCameraId, selectedMicId]
  );

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    setIsLeaving(true);
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (localScreenTrackRef.current) {
        if (Array.isArray(localScreenTrackRef.current)) {
          localScreenTrackRef.current.forEach((t) => {
            t.stop();
            t.close();
          });
        } else {
          localScreenTrackRef.current.stop();
          localScreenTrackRef.current.close();
        }
        localScreenTrackRef.current = null;
        setIsScreenSharing(false);
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
      setRemoteUsers([]);
      setParticipantInfo({});
      setIncomingMessages([]);
      setIsJoined(false);
      setIsMuted(false);
      setIsVideoOff(false);
    } catch (err) {
      console.error('Error leaving meeting:', err);
    } finally {
      setIsLeaving(false);
    }
  }, []);

  // Toggle Microphone
  const toggleMic = useCallback(async () => {
    if (!localAudioTrackRef.current) return;
    const nextState = !isMuted;
    await localAudioTrackRef.current.setEnabled(!nextState);
    setIsMuted(nextState);
  }, [isMuted]);

  // Toggle Camera
  const toggleCamera = useCallback(async () => {
    if (!localVideoTrackRef.current) return;
    const nextState = !isVideoOff;
    await localVideoTrackRef.current.setEnabled(!nextState);
    setIsVideoOff(nextState);
  }, [isVideoOff]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client || !isJoined) return;

    try {
      if (isScreenSharing) {
        if (localScreenTrackRef.current) {
          await client.unpublish(localScreenTrackRef.current);
          if (Array.isArray(localScreenTrackRef.current)) {
            localScreenTrackRef.current.forEach((t) => {
              t.stop();
              t.close();
            });
          } else {
            localScreenTrackRef.current.stop();
            localScreenTrackRef.current.close();
          }
          localScreenTrackRef.current = null;
        }
        if (localVideoTrackRef.current && !isVideoOff) {
          await client.publish(localVideoTrackRef.current);
        }
        setIsScreenSharing(false);
      } else {
        const screenTrack = await createScreenTrack();
        localScreenTrackRef.current = screenTrack;

        if (localVideoTrackRef.current) {
          await client.unpublish(localVideoTrackRef.current);
        }

        const trackToPublish = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
        await client.publish(trackToPublish);

        const singleTrack = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
        singleTrack.on('track-ended', async () => {
          if (clientRef.current && localVideoTrackRef.current && !isVideoOff) {
            try {
              await clientRef.current.unpublish(singleTrack);
              await clientRef.current.publish(localVideoTrackRef.current);
            } catch (e) {
              console.error('Error reverting camera track on screen share end:', e);
            }
          }
          setIsScreenSharing(false);
          localScreenTrackRef.current = null;
        });

        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  }, [isJoined, isScreenSharing, isVideoOff]);

  // Switch Camera Device
  const switchCamera = useCallback(async (deviceId) => {
    setSelectedCameraId(deviceId);
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setDevice(deviceId);
    }
  }, []);

  // Switch Microphone Device
  const switchMicrophone = useCallback(async (deviceId) => {
    setSelectedMicId(deviceId);
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setDevice(deviceId);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }
      if (localScreenTrackRef.current) {
        if (Array.isArray(localScreenTrackRef.current)) {
          localScreenTrackRef.current.forEach((t) => {
            t.stop();
            t.close();
          });
        } else {
          localScreenTrackRef.current.stop();
          localScreenTrackRef.current.close();
        }
      }
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
    };
  }, []);

  return {
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
    networkQuality,
    devices,
    selectedCameraId,
    selectedMicId,
    localAudioTrack: localAudioTrackRef.current,
    localVideoTrack: isScreenSharing ? (Array.isArray(localScreenTrackRef.current) ? localScreenTrackRef.current[0] : localScreenTrackRef.current) : localVideoTrackRef.current,
    joinMeeting,
    leaveMeeting,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    switchCamera,
    switchMicrophone,
    refreshDevices,
    sendChatMessage,
  };
}
