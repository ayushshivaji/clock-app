import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');

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