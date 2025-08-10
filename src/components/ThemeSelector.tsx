import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ColorScheme } from '../constants/themes';

interface ThemeSelectorProps {
  onSelect: (scheme: ColorScheme) => void;
}

const themes: { scheme: ColorScheme; name: string; colors: string[] }[] = [
  { scheme: 'default', name: 'Default', colors: ['#00d9ff', '#ff9500'] },
  { scheme: 'ocean', name: 'Ocean', colors: ['#006ba6', '#0496ff'] },
  { scheme: 'sunset', name: 'Sunset', colors: ['#ff6b6b', '#ffd93d'] },
  { scheme: 'forest', name: 'Forest', colors: ['#2d6a4f', '#95d5b2'] },
  { scheme: 'monochrome', name: 'Monochrome', colors: ['#495057', '#adb5bd'] },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelect }) => {
  const { theme } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {themes.map((item) => (
        <TouchableOpacity
          key={item.scheme}
          style={[
            styles.themeOption,
            theme.colorScheme === item.scheme && styles.selectedTheme,
          ]}
          onPress={() => onSelect(item.scheme)}
        >
          <View style={styles.colorPreview}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: item.colors[0] },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: item.colors[1] },
              ]}
            />
          </View>
          <Text
            style={[
              styles.themeName,
              { color: theme.colors.text },
              theme.colorScheme === item.scheme && styles.selectedText,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  themeOption: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
  },
  selectedTheme: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 2,
  },
  themeName: {
    fontSize: 12,
  },
  selectedText: {
    fontWeight: 'bold',
  },
});