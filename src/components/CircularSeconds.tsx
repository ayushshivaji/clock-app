import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width, height) * 0.6;
const RADIUS = CLOCK_SIZE / 2 - 20;

interface CircularSecondsProps {
  currentSecond: number;
}

export const CircularSeconds: React.FC<CircularSecondsProps> = ({ currentSecond }) => {
  const { theme } = useTheme();

  const renderSecondNumbers = () => {
    const numbers = [];
    
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      
      const isHighlighted = i === currentSecond;
      
      numbers.push(
        <View
          key={i}
          style={[
            styles.numberContainer,
            {
              transform: [
                { translateX: x },
                { translateY: y },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.number,
              {
                color: isHighlighted 
                  ? theme.colors.highlight 
                  : theme.colors.secondaryText,
                fontSize: isHighlighted ? 20 : 16,
                fontWeight: isHighlighted ? 'bold' : 'normal',
                opacity: isHighlighted ? 1 : 0.1,
              },
            ]}
          >
            {i.toString().padStart(2, '0')}
          </Text>
          {isHighlighted && (
            <View
              style={[
                styles.highlightGlow,
                {
                  backgroundColor: theme.colors.highlightGlow,
                },
              ]}
            />
          )}
        </View>
      );
    }
    
    return numbers;
  };

  return (
    <View style={styles.container}>
      {renderSecondNumbers()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    textAlign: 'center',
  },
  highlightGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: -1,
  },
});