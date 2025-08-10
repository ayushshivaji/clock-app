import { Colors, ThemeColors } from './colors';

export type ThemeMode = 'light' | 'dark';
export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'monochrome';

export interface Theme {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: {
    background: string;
    text: string;
    secondaryText: string;
    gradientStart: string;
    gradientEnd: string;
    highlight: string;
    highlightGlow: string;
  };
}

export const getTheme = (mode: ThemeMode, colorScheme: ColorScheme): Theme => {
  const baseColors = Colors[mode];
  
  let schemeColors = {};
  if (colorScheme !== 'default' && ThemeColors[colorScheme]) {
    schemeColors = ThemeColors[colorScheme][mode] || {};
  }

  return {
    mode,
    colorScheme,
    colors: {
      ...baseColors,
      ...schemeColors,
    },
  };
};