import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getTimeSize } from '../utils/responsive';

interface TimeDisplayProps {
  time: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ time }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: theme.colors.text, fontSize: getTimeSize() }]}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontWeight: '300',
    letterSpacing: -2,
  },
});