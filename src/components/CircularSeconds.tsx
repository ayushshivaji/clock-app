import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { getClockSize } from '../utils/responsive';

const CLOCK_SIZE = getClockSize();
const RADIUS = CLOCK_SIZE / 2 - 20;

interface CircularSecondsProps {
  currentSecond: number;
}

// Create a separate component for each second number to handle animations properly
const SecondNumber: React.FC<{ 
  second: number; 
  isActive: boolean; 
  x: number; 
  y: number; 
  theme: any; 
}> = ({ second, isActive, x, y, theme }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1.4 : 1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withSpring(isActive ? 1 : 0.4, {
      damping: 20,
      stiffness: 100,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x },
      { translateY: y },
      { scale: scale.value },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.numberContainer, animatedStyle]}>
      <Animated.Text
        style={[
          styles.number,
          textAnimatedStyle,
          {
            color: isActive ? theme.colors.highlight : theme.colors.secondaryText,
            fontWeight: isActive ? 'bold' : 'normal',
          },
        ]}
      >
        {second.toString().padStart(2, '0')}
      </Animated.Text>
      {isActive && (
        <View
          style={[
            styles.highlightGlow,
            {
              backgroundColor: theme.colors.highlightGlow,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

export const CircularSeconds: React.FC<CircularSecondsProps> = ({ currentSecond }) => {
  const { theme } = useTheme();

  const activeAngle = (currentSecond * 6 - 90) * (Math.PI / 180);
  const activeX = RADIUS * Math.cos(activeAngle);
  const activeY = RADIUS * Math.sin(activeAngle);

  // Center of the clock
  const centerX = CLOCK_SIZE / 2;
  const centerY = CLOCK_SIZE / 2;

  // End position for radius line
  const endX = centerX + activeX;
  const endY = centerY + activeY;

  const secondPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      positions.push({ second: i, x, y });
    }
    return positions;
  }, []);

  return (
    <View style={styles.container}>
      {/* Radius line with gradient */}
      <Svg 
        width={CLOCK_SIZE} 
        height={CLOCK_SIZE}
        style={styles.svgContainer}
      >
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={theme.colors.secondaryText} stopOpacity="0" />
            <Stop offset="50%" stopColor={theme.colors.secondaryText} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={theme.colors.secondaryText} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Line
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke="url(#lineGradient)"
          strokeWidth="1"
        />
      </Svg>
      
      {/* All second numbers */}
      {secondPositions.map(({ second, x, y }) => (
        <SecondNumber
          key={second}
          second={second}
          isActive={second === currentSecond}
          x={x}
          y={y}
          theme={theme}
        />
      ))}
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
  svgContainer: {
    position: 'absolute',
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