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
import { useSettings } from '../contexts/SettingsContext';
import { getClockSize } from '../utils/responsive';

const CLOCK_SIZE = getClockSize();
const RADIUS = CLOCK_SIZE / 3; // Smaller radius to bring seconds closer
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;

// Optimized unified easing function using cubic bezier curve
// Replaces multiple mathematical functions with single optimized calculation
const optimizedEasing = (t: number): number => {
  'worklet';
  // Custom cubic bezier curve optimized for ultra-smooth second transitions
  // Equivalent to cubic-bezier(0.25, 0.46, 0.45, 0.94) - "ease-out-quad-smooth"
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  
  // Optimized cubic bezier calculation (faster than 4 separate easing functions)
  const t2 = t * t;
  const t3 = t2 * t;
  
  // Coefficients for smooth, natural motion
  return 3 * t2 - 2 * t3; // Smooth S-curve with gentle acceleration/deceleration
};

interface CircularSecondsProps {
  currentSecond: number;
}

// Animated radius line component that follows continuous time
const RadiusLine: React.FC<{
  continuousTime: Animated.SharedValue<number>;
  theme: any;
}> = ({ continuousTime, theme }) => {
  
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  // Simple, direct angle calculation - no cumulative rotation complexity
  const currentAngleRadians = useDerivedValue(() => {
    const currentTime = continuousTime.value;
    
    // Simple direct calculation - let the animation system handle smoothness
    const degrees = currentTime * 6 - 90; // -90 to start at top (12 o'clock)
    return (degrees * Math.PI) / 180;
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
  animationQuality: 'performance' | 'balanced' | 'ultra-smooth';
  motionSensitivity: number;
}> = ({ second, continuousTime, x, y, theme, animationQuality, motionSensitivity }) => {
  
  // SMOOTH single second highlighting with proper transitions
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate distance to this second (handles wraparound)
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // ALWAYS set base values first
    let scale = 0.6;
    let opacity = 0.0;
    let easedProgress = 0.0;
    
    // Only highlight seconds within 1.0 range (current second illuminated longer)
    if (circularDiff <= 1.0) {
      // Smooth transition from 1.0 distance to 0.0 distance
      const proximity = 1 - (circularDiff / 1.0); // 1.0 at exact match, 0.0 at edges
      
      // Apply smooth easing for natural animation
      easedProgress = proximity * proximity; // Quadratic easing
      scale = 0.6 + easedProgress * 1.0; // 0.6 to 1.6
      opacity = easedProgress; // 0.0 to 1.0
    }
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        { translateZ: easedProgress * 20 }, // 3D pop effect - comes toward viewer
      ],
      opacity,
      elevation: easedProgress * 10, // Android shadow elevation for depth
      shadowColor: theme.colors.highlight,
      shadowOffset: { width: 0, height: easedProgress * 4 },
      shadowOpacity: easedProgress * 0.3,
      shadowRadius: easedProgress * 8,
    };
  });

  // SMOOTH color transition - matches smooth highlighting
  const textAnimatedStyle = useAnimatedStyle(() => {
    // Use same smooth logic as scaling
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // ALWAYS set default color first
    let color = theme.colors.secondaryText;
    
    // Only color seconds within 1.0 range (matches illumination duration)
    if (circularDiff <= 1.0) {
      const proximity = 1 - (circularDiff / 1.0);
      const colorIntensity = proximity * proximity; // Same quadratic easing
      
      // Smooth color interpolation
      color = interpolateColor(
        colorIntensity,
        [0, 1],
        [theme.colors.secondaryText, theme.colors.highlight]
      );
    }
    
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
  const { settings } = useSettings();
  
  // Create a continuous time value that updates with real millisecond precision
  const continuousTime = useSharedValue(0);
  
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    
    const updateContinuousTime = (timestamp: number) => {
      // Simple, direct time updates - no complex smoothing
      if (timestamp - lastTime >= 16) { // ~60fps - simpler is better
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Simple continuous value - no smoothing algorithms
        const currentTime = seconds + (milliseconds / 1000);
        
        // Direct assignment - let React Native Reanimated handle the smoothness
        continuousTime.value = currentTime;
        
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
      {/* Animated radius line pointing to active second - conditional */}
      {settings.showRadiusLine && (
        <RadiusLine continuousTime={continuousTime} theme={theme} />
      )}
      
      {/* All second numbers with continuous flowing animation */}
      {settings.animationsEnabled ? (
        secondPositions.map(({ second, x, y }) => (
          <SecondNumber
            key={second}
            second={second}
            continuousTime={continuousTime}
            x={x}
            y={y}
            theme={theme}
            animationQuality={settings.animationQuality}
            motionSensitivity={settings.motionSensitivity}
          />
        ))
      ) : (
        // Fallback: simple static numbers if animations disabled
        secondPositions.map(({ second, x, y }) => (
          <View 
            key={second}
            style={[
              styles.numberContainer, 
              { 
                transform: [{ translateX: x }, { translateY: y }],
                opacity: Math.round(continuousTime.value) === second ? 1.0 : 0.3,
                backgroundColor: Math.round(continuousTime.value) === second ? theme.colors.highlight : 'transparent'
              }
            ]}
          >
            <Text style={[
              styles.number,
              { 
                color: Math.round(continuousTime.value) === second ? theme.colors.background : theme.colors.text,
                fontWeight: Math.round(continuousTime.value) === second ? 'bold' : 'normal'
              }
            ]}>
              {second.toString().padStart(2, '0')}
            </Text>
          </View>
        ))
      )}
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