/**
 * Agora RTC Configuration and Local Storage helper
 */

const STORAGE_KEY = 'soulsensei_agora_app_id';

export const getAgoraAppId = () => {
  const envAppId = import.meta.env.VITE_AGORA_APP_ID;
  if (envAppId && envAppId.trim()) {
    return envAppId.trim();
  }
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setAgoraAppId = (appId) => {
  if (appId) {
    localStorage.setItem(STORAGE_KEY, appId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const AGORA_DEFAULTS = {
  mode: 'rtc',
  codec: 'vp8',
  role: 'host', // default role
};
