import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { getClockSize } from '../utils/responsive';

const CLOCK_SIZE = getClockSize();
const RADIUS = CLOCK_SIZE / 2 - 5; // Larger radius for better spacing
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;

interface CircularSecondsProps {
  currentSecond: number;
}

// Animated radius line component that follows continuous time
const RadiusLine: React.FC<{
  continuousTime: Animated.SharedValue<number>;
  theme: any;
}> = ({ continuousTime, theme }) => {
  
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  
  const animatedProps = useAnimatedStyle(() => {
    // Calculate the angle for the current continuous time (in degrees)
    const angleDegrees = continuousTime.value * 6 - 90; // -90 to start at 12 o'clock
    
    // Calculate the end position of the line
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const endX = CENTER_X + RADIUS * Math.cos(angleRadians);
    const endY = CENTER_Y + RADIUS * Math.sin(angleRadians);
    
    return {
      // No transform needed - we'll calculate line positions directly
    };
  });

  // Calculate current line positions for SVG
  const currentAngleRadians = useDerivedValue(() => {
    return ((continuousTime.value * 6 - 90) * Math.PI) / 180;
  });

  const AnimatedLine = Animated.createAnimatedComponent(Line);

  return (
    <View style={styles.radiusLineContainer}>
      <Svg width={CLOCK_SIZE} height={CLOCK_SIZE} style={styles.radiusLineSvg}>
        <Defs>
          <LinearGradient id="radiusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={theme.colors.highlight} stopOpacity="0.05" />
            <Stop offset="20%" stopColor={theme.colors.highlight} stopOpacity="0.3" />
            <Stop offset="50%" stopColor={theme.colors.highlight} stopOpacity="0.9" />
            <Stop offset="80%" stopColor={theme.colors.highlight} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={theme.colors.highlight} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        
        {/* Animated radius line from center to active second position with center-fade gradient */}
        <AnimatedLine
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={CENTER_X + RADIUS * Math.cos(currentAngleRadians.value)}
          y2={CENTER_Y + RADIUS * Math.sin(currentAngleRadians.value)}
          stroke="url(#radiusGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          animatedProps={useAnimatedStyle(() => ({
            x2: CENTER_X + RADIUS * Math.cos(currentAngleRadians.value),
            y2: CENTER_Y + RADIUS * Math.sin(currentAngleRadians.value),
          }))}
        />
      </Svg>
    </View>
  );
};

// Create a separate component for each second number with continuous fluid animation
const SecondNumber: React.FC<{ 
  second: number; 
  continuousTime: Animated.SharedValue<number>;
  x: number; 
  y: number; 
  theme: any; 
}> = ({ second, continuousTime, x, y, theme }) => {
  
  // Create ultra-smooth animated styles with better interpolation
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate distance from current continuous time
    const diff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(diff, 60 - diff); // Handle wrap-around
    
    // Smaller base scale for inactive seconds to prevent overlap
    let scale = 0.6; // Much smaller inactive seconds
    let opacity = 0.15; // Lower base opacity
    
    if (circularDiff <= 2.0) {
      // Smoother, wider influence zone with exponential easing
      const normalizedDistance = circularDiff / 2.0;
      const easedProximity = 1 - Math.pow(normalizedDistance, 0.5); // Smooth exponential curve
      
      scale = 0.6 + easedProximity * 1.0; // Scale from 0.6 to 1.6
      opacity = 0.15 + easedProximity * 0.85; // Opacity from 0.15 to 1.0
    }
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      opacity,
    };
  });

  // Ultra-smooth color interpolation based on continuous proximity
  const textAnimatedStyle = useAnimatedStyle(() => {
    const diff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(diff, 60 - diff);
    
    // Create smooth color interpolation based on distance
    let interpolationProgress = 0;
    
    if (circularDiff <= 2.0) {
      // Normalize distance to 0-1 range, with exponential easing for smoothness
      const normalizedDistance = circularDiff / 2.0;
      interpolationProgress = 1 - Math.pow(normalizedDistance, 0.3); // Smooth exponential curve
    }
    
    // Smooth color interpolation through theme colors
    const color = interpolateColor(
      interpolationProgress,
      [0, 0.3, 1], // Input range: far -> nearby -> current
      [theme.colors.secondaryText, theme.colors.text, theme.colors.highlight] // Color progression
    );
    
    return {
      color,
    };
  });

  return (
    <Animated.View style={[styles.numberContainer, animatedStyle]}>
      <Animated.Text
        style={[
          styles.number,
          textAnimatedStyle,
        ]}
      >
        {second.toString().padStart(2, '0')}
      </Animated.Text>
    </Animated.View>
  );
};

export const CircularSeconds: React.FC<CircularSecondsProps> = ({ currentSecond }) => {
  const { theme } = useTheme();
  
  // Create a continuous time value that updates with real millisecond precision
  const continuousTime = useSharedValue(0);
  
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    
    const updateContinuousTime = (timestamp: number) => {
      // Throttle to ~120fps for ultra-smooth animation without overloading
      if (timestamp - lastTime >= 8.33) { // ~120fps
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Create ultra-smooth continuous value with higher precision
        const smoothTime = seconds + (milliseconds / 1000);
        
        // Update the shared value directly for instant UI updates
        continuousTime.value = smoothTime;
        
        lastTime = timestamp;
      }
      
      // Schedule next update
      animationFrame = requestAnimationFrame(updateContinuousTime);
    };
    
    // Start the continuous updates
    animationFrame = requestAnimationFrame(updateContinuousTime);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

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
      {/* Animated radius line pointing to active second */}
      <RadiusLine continuousTime={continuousTime} theme={theme} />
      
      {/* All second numbers with continuous flowing animation */}
      {secondPositions.map(({ second, x, y }) => (
        <SecondNumber
          key={second}
          second={second}
          continuousTime={continuousTime}
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
  radiusLineContainer: {
    position: 'absolute',
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusLineSvg: {
    position: 'absolute',
  },
  numberContainer: {
    position: 'absolute',
    width: 20, // Smaller container to prevent overlap
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    textAlign: 'center',
    fontSize: 12, // Smaller font for inactive seconds
    lineHeight: 14,
    fontWeight: '400',
  },
});