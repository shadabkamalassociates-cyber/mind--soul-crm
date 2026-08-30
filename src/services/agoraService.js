import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_DEFAULTS } from '../config/agora';

// Set Agora RTC logging level (WARN to keep console clean)
AgoraRTC.setLogLevel(2);

/**
 * Creates an Agora RTC client instance
 */
export const createAgoraClient = (config = {}) => {
  return AgoraRTC.createClient({
    mode: config.mode || AGORA_DEFAULTS.mode,
    codec: config.codec || AGORA_DEFAULTS.codec,
  });
};

/**
 * Creates microphone and camera tracks
 */
export const createLocalTracks = async (audioConfig = {}, videoConfig = {}) => {
  try {
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
      {
        microphoneId: audioConfig.deviceId,
        AEC: true,
        ANS: true,
        AGC: true,
        ...audioConfig,
      },
      {
        cameraId: videoConfig.deviceId,
        encoderConfig: videoConfig.encoderConfig || '720p_1',
        ...videoConfig,
      }
    );
    return { audioTrack, videoTrack };
  } catch (error) {
    console.error('Error creating local audio/video tracks:', error);
    throw error;
  }
};

/**
 * Creates a screen share track
 */
export const createScreenTrack = async (withAudio = false) => {
  try {
    const screenTrack = await AgoraRTC.createScreenVideoTrack(
      {
        encoderConfig: '1080p_1',
        optimizationMode: 'detail',
      },
      withAudio ? 'enable' : 'disable'
    );
    return screenTrack;
  } catch (error) {
    console.error('Error creating screen share track:', error);
    throw error;
  }
};

/**
 * Enumerate connected audio and video devices
 */
export const getConnectedDevices = async () => {
  try {
    const devices = await AgoraRTC.getDevices();
    const cameras = devices.filter((d) => d.kind === 'videoinput');
    const microphones = devices.filter((d) => d.kind === 'audioinput');
    const playbackDevices = devices.filter((d) => d.kind === 'audiooutput');
    return { cameras, microphones, playbackDevices };
  } catch (error) {
    console.error('Error getting connected devices:', error);
    return { cameras: [], microphones: [], playbackDevices: [] };
  }
};

export default AgoraRTC;
