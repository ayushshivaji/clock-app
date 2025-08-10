import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { SettingsItem } from '../components/SettingsItem';
import { ThemeSelector } from '../components/ThemeSelector';
import { ColorScheme, ThemeMode } from '../constants/themes';

export const SettingsScreen: React.FC = () => {
  const { theme, setThemeMode, setColorScheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const navigation = useNavigation();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleThemeToggle = () => {
    const newMode: ThemeMode = theme.mode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const handleTimeFormatToggle = (is24Hour: boolean) => {
    updateSettings({ is24Hour });
  };

  const handleAnimationsToggle = (animationsEnabled: boolean) => {
    updateSettings({ animationsEnabled });
  };

  const handlePaperMacheToggle = (paperMacheBackground: boolean) => {
    updateSettings({ paperMacheBackground });
  };

  const handleRadiusLineToggle = (showRadiusLine: boolean) => {
    updateSettings({ showRadiusLine });
  };

  const handleThemeSelect = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    setShowThemeSelector(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            APPEARANCE
          </Text>
          
          <SettingsItem
            label="Dark Mode"
            type="toggle"
            isEnabled={theme.mode === 'dark'}
            onToggle={handleThemeToggle}
          />
          
          <SettingsItem
            label="Color Theme"
            value={theme.colorScheme.charAt(0).toUpperCase() + theme.colorScheme.slice(1)}
            type="selector"
            onPress={() => setShowThemeSelector(!showThemeSelector)}
          />
          
          {showThemeSelector && (
            <View style={styles.themeSelector}>
              <ThemeSelector onSelect={handleThemeSelect} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            TIME SETTINGS
          </Text>
          
          <SettingsItem
            label="24-Hour Format"
            type="toggle"
            isEnabled={settings.is24Hour}
            onToggle={handleTimeFormatToggle}
          />
          
          <SettingsItem
            label="Time Zone"
            value="Local Time"
            type="selector"
            onPress={() => {/* TODO: Implement timezone selector */}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            ANIMATIONS
          </Text>
          
          <SettingsItem
            label="Enable Animations"
            type="toggle"
            isEnabled={settings.animationsEnabled}
            onToggle={handleAnimationsToggle}
          />

          <SettingsItem
            label="Show Radius Line"
            type="toggle"
            isEnabled={settings.showRadiusLine}
            onToggle={handleRadiusLineToggle}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            BACKGROUND
          </Text>
          
          <SettingsItem
            label="Paper Mache Effect"
            type="toggle"
            isEnabled={settings.paperMacheBackground}
            onToggle={handlePaperMacheToggle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 10,
  },
  themeSelector: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});