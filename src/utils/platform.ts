import { Platform, Dimensions } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';

export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const requestFullscreen = () => {
  if (isWeb && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
};

export const exitFullscreen = () => {
  if (isWeb && document.exitFullscreen) {
    document.exitFullscreen();
  }
};

export const isFullscreen = (): boolean => {
  if (isWeb) {
    return !!(document as any).fullscreenElement;
  }
  return false;
};

export const addFullscreenListener = (callback: (isFullscreen: boolean) => void) => {
  if (isWeb) {
    const handleChange = () => callback(isFullscreen());
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }
  return () => {};
};