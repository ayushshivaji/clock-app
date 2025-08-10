import { useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const useAnimation = () => {
  const { settings } = useSettings();

  const shouldAnimate = useCallback(() => {
    return settings.animationsEnabled;
  }, [settings.animationsEnabled]);

  const getAnimationConfig = useCallback(() => {
    if (!settings.animationsEnabled) {
      return { duration: 0 };
    }
    
    return {
      duration: 100,
      easing: 'linear' as const,
    };
  }, [settings.animationsEnabled]);

  return {
    shouldAnimate,
    getAnimationConfig,
    isAnimationEnabled: settings.animationsEnabled,
  };
};