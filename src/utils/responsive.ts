import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

// Responsive breakpoints
export const isTablet = width >= 768;
export const isSmallScreen = width < 375;
export const isLargeScreen = width >= 1024;

// Scale functions for responsive design
export const scaleSize = (size: number): number => {
  const baseWidth = 375; // iPhone X width as baseline
  const scale = width / baseWidth;
  return Math.round(size * scale);
};

export const scaleFontSize = (size: number): number => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  // Limit font scaling to prevent text from becoming too large
  const limitedScale = Math.min(scale, 1.5);
  return Math.round(size * limitedScale);
};

export const getClockSize = (): number => {
  const minDimension = Math.min(width, height);
  if (isLargeScreen) {
    return minDimension * 0.35; // Smaller on large screens
  } else if (isTablet) {
    return minDimension * 0.4;
  } else if (isSmallScreen) {
    return minDimension * 0.5; // Larger on small screens
  }
  return minDimension * 0.45; // Default size
};

export const getTimeSize = (): number => {
  if (isLargeScreen) return scaleFontSize(56);
  if (isTablet) return scaleFontSize(52);
  if (isSmallScreen) return scaleFontSize(40);
  return scaleFontSize(48);
};