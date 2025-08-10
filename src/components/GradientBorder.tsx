import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width, height) * 0.6;
const RADIUS = CLOCK_SIZE / 2;

interface GradientBorderProps {
  rotation: number;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({ rotation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
        <Defs>
          <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.gradientStart} />
            <Stop offset="100%" stopColor={theme.colors.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={RADIUS}
          cy={RADIUS}
          r={RADIUS - 5}
          stroke="url(#borderGradient)"
          strokeWidth={3}
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
  },
});