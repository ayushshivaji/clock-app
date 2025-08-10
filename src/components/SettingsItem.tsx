import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsItemProps {
  label: string;
  value?: string;
  type: 'toggle' | 'selector';
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  value,
  type,
  isEnabled,
  onToggle,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.colors.secondaryText }]}
      onPress={type === 'selector' ? onPress : undefined}
      activeOpacity={type === 'selector' ? 0.7 : 1}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        {value && (
          <Text style={[styles.value, { color: theme.colors.secondaryText }]}>
            {value}
          </Text>
        )}
      </View>
      {type === 'toggle' && (
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ 
            false: theme.colors.secondaryText, 
            true: theme.colors.gradientStart 
          }}
          thumbColor={isEnabled ? theme.colors.highlight : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    marginTop: 4,
  },
});