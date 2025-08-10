import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SettingsProvider>
    </ThemeProvider>
  );
}
