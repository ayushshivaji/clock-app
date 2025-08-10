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
const RADIUS = CLOCK_SIZE / 2 - 5; // Larger radius for better spacing
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
  animationQuality: 'performance' | 'balanced' | 'ultra-smooth';
  motionSensitivity: number;
}> = ({ second, continuousTime, x, y, theme, animationQuality, motionSensitivity }) => {
  
  // ROBUST highlighting - simple and reliable
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate distance from current continuous time
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // ALWAYS set base values first
    let scale = 0.6;
    let opacity = 0.3;
    
    // Simple, reliable highlighting
    if (circularDiff < 2.0) {
      const proximity = Math.max(0, 1 - (circularDiff / 2.0));
      scale = 0.6 + proximity * 0.8; // 0.6 to 1.4
      opacity = 0.3 + proximity * 0.7; // 0.3 to 1.0
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

  // ROBUST color highlighting - simple and reliable
  const textAnimatedStyle = useAnimatedStyle(() => {
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // ALWAYS set default color first
    let color = theme.colors.secondaryText;
    
    // Simple, reliable color highlighting
    if (circularDiff < 2.0) {
      const proximity = Math.max(0, 1 - (circularDiff / 2.0));
      color = interpolateColor(
        proximity,
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
    let lastSmoothedTime = 0;
    let timeHistory: number[] = []; // Store last 5 time samples for multi-sample averaging
    let velocityHistory: number[] = []; // Track time velocity for prediction
    let refreshRate = 60; // Detected refresh rate
    
    // Detect device refresh rate for optimal smoothing
    const detectRefreshRate = () => {
      const start = performance.now();
      let frameCount = 0;
      const measureFrames = (currentTime: number) => {
        frameCount++;
        if (frameCount < 60) {
          requestAnimationFrame(measureFrames);
        } else {
          const elapsed = currentTime - start;
          refreshRate = Math.round((frameCount * 1000) / elapsed);
          // Clamp to common refresh rates
          if (refreshRate > 110) refreshRate = 120;
          else if (refreshRate > 90) refreshRate = 90;
          else refreshRate = 60;
        }
      };
      requestAnimationFrame(measureFrames);
    };
    detectRefreshRate();
    
    const updateContinuousTime = (timestamp: number) => {
      // Moderate speed - smooth but responsive
      if (timestamp - lastTime >= 12) { // ~80fps for smooth but faster animation
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Create ultra-precise continuous value
        const currentTime = seconds + (milliseconds / 1000);
        
        // Keep some history for stability but less than before
        timeHistory.push(currentTime);
        if (timeHistory.length > 3) timeHistory.shift(); // Keep last 3 samples
        
        // Moderate smoothing - faster than before but not shaky
        const timeDelta = timestamp - lastTime;
        let smoothingFactor = 0.75; // Balanced smoothing
        if (refreshRate >= 120) smoothingFactor = 0.8; // Slightly more for high refresh
        
        // Simple averaging with current time for stability
        const avgTime = timeHistory.reduce((a, b) => a + b) / timeHistory.length;
        const blendedTime = avgTime * 0.7 + currentTime * 0.3; // Favor average for stability
        
        // Smooth interpolation with moderate factor
        const smoothedTime = lastSmoothedTime + (blendedTime - lastSmoothedTime) * smoothingFactor;
        
        // Update the shared value
        continuousTime.value = smoothedTime;
        
        lastTime = timestamp;
        lastSmoothedTime = smoothedTime;
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