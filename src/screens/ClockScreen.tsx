import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { TimeDisplay } from '../components/TimeDisplay';
import { CircularSeconds } from '../components/CircularSeconds';
import { PaperMacheBackground } from '../components/PaperMacheBackground';
import { formatTime, getSeconds, getTimeForTimeZone } from '../utils/time';
import { RootStackParamList } from '../navigation/AppNavigator';
import { 
  isWeb, 
  requestFullscreen, 
  exitFullscreen, 
  isFullscreen, 
  addFullscreenListener,
  isIOS
} from '../utils/platform';

type ClockScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Clock'>;

export const ClockScreen: React.FC = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const navigation = useNavigation<ClockScreenNavigationProp>();
  
  const [time, setTime] = useState(new Date());
  const [isInFullscreen, setIsInFullscreen] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateTime = () => {
      const now = getTimeForTimeZone(settings.timeZone);
      setTime(now);
    };

    // Update time every second
    updateTime(); // Initial update
    intervalId = setInterval(updateTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [settings.timeZone]);

  // Web-specific keyboard shortcuts and fullscreen
  useEffect(() => {
    if (!isWeb) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'f':
        case 'F':
          if (isFullscreen()) {
            exitFullscreen();
          } else {
            requestFullscreen();
          }
          break;
        case 's':
        case 'S':
          navigation.navigate('Settings');
          break;
        case 'Escape':
          if (isFullscreen()) {
            exitFullscreen();
          }
          break;
      }
    };

    const removeFullscreenListener = addFullscreenListener(setIsInFullscreen);

    document.addEventListener('keydown', handleKeyPress);
    setIsInFullscreen(isFullscreen());

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      removeFullscreenListener();
    };
  }, [navigation]);

  const formattedTime = formatTime(time, settings.is24Hour);
  const currentSecond = getSeconds(time);

  const ContainerComponent = isIOS ? SafeAreaView : View;

  return (
    <ContainerComponent style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Paper Mache Background */}
      {settings.paperMacheBackground && <PaperMacheBackground />}
      
      {/* Settings button - hide in fullscreen mode on web */}
      {!(isWeb && isInFullscreen) && (
        <TouchableOpacity
          style={[styles.settingsButton, isIOS && styles.settingsButtonIOS]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      {/* Fullscreen button for web */}
      {isWeb && (
        <TouchableOpacity
          style={[styles.fullscreenButton, isInFullscreen && styles.fullscreenButtonActive]}
          onPress={() => isInFullscreen ? exitFullscreen() : requestFullscreen()}
        >
          <Ionicons 
            name={isInFullscreen ? "contract-outline" : "expand-outline"} 
            size={20} 
            color={theme.colors.secondaryText} 
          />
        </TouchableOpacity>
      )}
      
      <View style={styles.clockContainer}>
        <CircularSeconds currentSecond={currentSecond} />
        <TimeDisplay time={formattedTime} />
      </View>

      {/* Web keyboard shortcuts hint - only show briefly on first load */}
      {isWeb && !isInFullscreen && (
        <View style={[styles.keyboardHints, { borderColor: theme.colors.secondaryText }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.secondaryText} />
          <View style={styles.hintText}>
            <Text style={[styles.hintTextSmall, { color: theme.colors.secondaryText }]}>
              Press F for fullscreen • S for settings • ESC to exit fullscreen
            </Text>
          </View>
        </View>
      )}
    </ContainerComponent>
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
  settingsButtonIOS: {
    top: 10, // Adjust for SafeAreaView
  },
  fullscreenButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 10,
    opacity: 0.7,
  },
  fullscreenButtonActive: {
    opacity: 1,
  },
  clockContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardHints: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    opacity: 0.6,
  },
  hintText: {
    marginLeft: 8,
    flex: 1,
  },
  hintTextSmall: {
    fontSize: 12,
    textAlign: 'center',
  },
});