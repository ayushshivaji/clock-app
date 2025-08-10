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
  
  // Track cumulative rotation to avoid wraparound jumps
  const cumulativeRotation = useSharedValue(0);
  const lastTime = useSharedValue(0);
  
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  // Calculate smooth continuous angle without wraparound issues
  const currentAngleRadians = useDerivedValue(() => {
    const currentTime = continuousTime.value;
    const timeDiff = currentTime - lastTime.value;
    
    // Handle wraparound: if time jumps backwards significantly, we wrapped around
    if (timeDiff < -30) {
      // We wrapped from 59.x to 0.x, add full rotation to maintain continuity
      cumulativeRotation.value += 360;
    } else if (timeDiff > 30) {
      // We jumped forward significantly (shouldn't happen but safety check)
      cumulativeRotation.value -= 360;
    }
    
    lastTime.value = currentTime;
    
    // Calculate angle with cumulative rotation for smooth wraparound
    const totalDegrees = (currentTime * 6 - 90) + cumulativeRotation.value;
    return (totalDegrees * Math.PI) / 180;
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
  
  // Ultra-fluid animated styles with advanced interpolation
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate distance from current continuous time with sub-millisecond precision
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff); // Handle wrap-around smoothly
    
    // Base values for inactive seconds
    let scale = 0.6;
    let opacity = 0.15;
    
    if (circularDiff <= 4.0) { // Much wider influence zone - affects ~8 seconds total
      // Multi-stage easing for natural motion feel with extended range
      const normalizedDistance = circularDiff / 4.0;
      
      // Combine multiple easing functions for ultra-smooth transitions across wider range
      const ease1 = 1 - Math.pow(normalizedDistance, 0.4); // Gentler power curve for wider spread
      const ease2 = Math.sin((1 - normalizedDistance) * Math.PI * 0.5); // Sine wave smoothness
      const ease3 = 1 - normalizedDistance * normalizedDistance; // Quadratic falloff
      const ease4 = Math.cos(normalizedDistance * Math.PI * 0.5); // Additional cosine smoothness
      
      // Blend multiple easing curves with wider influence
      const blendedProximity = (ease1 * 0.3 + ease2 * 0.3 + ease3 * 0.2 + ease4 * 0.2);
      
      // Apply ultra-smooth scaling with gentler transitions for wider effect
      const scaleFactor = blendedProximity * blendedProximity * 0.8; // Slightly reduced intensity for wider spread
      scale = 0.6 + scaleFactor;
      opacity = 0.15 + blendedProximity * 0.75; // Gentler opacity increase for wider visibility
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

  // Hyper-smooth color interpolation with advanced blending
  const textAnimatedStyle = useAnimatedStyle(() => {
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // Multi-layered color interpolation for maximum smoothness
    let interpolationProgress = 0;
    
    if (circularDiff <= 4.0) { // Match the wider influence zone for consistent highlighting
      const normalizedDistance = circularDiff / 4.0;
      
      // Quadruple-blended easing for ultra-wide color transitions
      const colorEase1 = 1 - Math.pow(normalizedDistance, 0.3); // Gentler power curve for wider spread
      const colorEase2 = Math.cos(normalizedDistance * Math.PI * 0.5); // Cosine smoothness
      const colorEase3 = 1 - normalizedDistance * normalizedDistance * normalizedDistance; // Cubic falloff
      const colorEase4 = Math.sin((1 - normalizedDistance) * Math.PI * 0.5); // Additional sine smoothness
      
      // Blend easing curves for ultra-natural wide color transitions
      interpolationProgress = (colorEase1 * 0.3 + colorEase2 * 0.3 + colorEase3 * 0.2 + colorEase4 * 0.2);
    }
    
    // Ultra-wide color interpolation with more gradual transitions
    const color = interpolateColor(
      interpolationProgress,
      [0, 0.15, 0.4, 0.7, 1], // Extended range for smoother wide transitions
      [theme.colors.secondaryText, theme.colors.secondaryText, theme.colors.text, theme.colors.text, theme.colors.highlight]
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
    let lastSmoothedTime = 0;
    
    const updateContinuousTime = (timestamp: number) => {
      // Run at native refresh rate (60fps/120fps/144fps depending on device)
      if (timestamp - lastTime >= 4) { // ~250fps max, adapts to device refresh rate
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Create ultra-precise continuous value
        const currentTime = seconds + (milliseconds / 1000);
        
        // Add micro-interpolation for even smoother motion between frames
        const timeDelta = timestamp - lastTime;
        const interpolationFactor = Math.min(timeDelta / 16.67, 1); // Normalize to 60fps baseline
        const smoothedTime = lastSmoothedTime + (currentTime - lastSmoothedTime) * interpolationFactor * 0.8;
        
        // Update the shared value with interpolated time
        continuousTime.value = smoothedTime;
        
        lastTime = timestamp;
        lastSmoothedTime = smoothedTime;
      }
      
      // Schedule next update at native refresh rate
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