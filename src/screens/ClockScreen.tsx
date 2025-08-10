import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { TimeDisplay } from '../components/TimeDisplay';
import { CircularSeconds } from '../components/CircularSeconds';
import { GradientBorder } from '../components/GradientBorder';
import { formatTime, getSeconds, getTimeForTimeZone } from '../utils/time';
import { RootStackParamList } from '../navigation/AppNavigator';

type ClockScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Clock'>;

export const ClockScreen: React.FC = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const navigation = useNavigation<ClockScreenNavigationProp>();
  
  const [time, setTime] = useState(new Date());
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getTimeForTimeZone(settings.timeZone);
      setTime(now);
      
      if (settings.animationsEnabled) {
        setRotation(prev => prev + 0.1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [settings.timeZone, settings.animationsEnabled]);

  const formattedTime = formatTime(time, settings.is24Hour);
  const currentSecond = getSeconds(time);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <View style={styles.clockContainer}>
        <GradientBorder rotation={rotation} />
        <CircularSeconds currentSecond={currentSecond} />
        <TimeDisplay time={formattedTime} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  clockContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});