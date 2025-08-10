import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, ColorScheme, getTheme } from '../constants/themes';

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('@theme_mode');
      const savedScheme = await AsyncStorage.getItem('@color_scheme');
      
      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      }
      if (savedScheme) {
        setColorSchemeState(savedScheme as ColorScheme);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('@theme_mode', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await AsyncStorage.setItem('@color_scheme', scheme);
    } catch (error) {
      console.error('Error saving color scheme:', error);
    }
  };

  const theme = getTheme(themeMode, colorScheme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeMode,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};