import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Line, Circle, RadialGradient, Ellipse } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  runOnJS,
  interpolateColor,
  withTiming,
  Easing,
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

// Water bubble component that encapsulates and moves to the current second
const WaterBubble: React.FC<{
  continuousTime: Animated.SharedValue<number>;
  theme: any;
  secondPositions: { second: number; x: number; y: number }[];
}> = ({ continuousTime, theme, secondPositions }) => {
  
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

  // Calculate bubble position based on continuous time
  const bubblePosition = useDerivedValue(() => {
    const currentTime = continuousTime.value;
    const currentSecond = Math.floor(currentTime);
    const nextSecond = (currentSecond + 1) % 60;
    const progress = currentTime - currentSecond;
    
    // Start moving when we're 0.2 seconds into the current second
    const moveProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));
    // Use smooth easing with built-in function
    const easedProgress = moveProgress * moveProgress * (3 - 2 * moveProgress); // Smooth step
    
    const currentPos = secondPositions[currentSecond];
    const nextPos = secondPositions[nextSecond];
    
    // Interpolate position
    const x = currentPos.x + (nextPos.x - currentPos.x) * easedProgress;
    const y = currentPos.y + (nextPos.y - currentPos.y) * easedProgress;
    
    return { x, y, progress: easedProgress };
  });

  const bubbleStyle = useAnimatedStyle(() => {
    const pos = bubblePosition.value;
    return {
      transform: [
        { translateX: pos.x },
        { translateY: pos.y },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bubbleContainer, bubbleStyle]}>
      <Svg width={40} height={40} style={styles.bubbleSvg}>
        <Defs>
          {/* Main bubble gradient - translucent with realistic refraction */}
          <RadialGradient id="bubbleGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={theme.colors.highlight} stopOpacity="0.1" />
            <Stop offset="30%" stopColor={theme.colors.highlight} stopOpacity="0.15" />
            <Stop offset="70%" stopColor={theme.colors.highlight} stopOpacity="0.25" />
            <Stop offset="85%" stopColor={theme.colors.highlight} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={theme.colors.highlight} stopOpacity="0.6" />
          </RadialGradient>
          
          {/* Bubble shine gradient for realistic highlight */}
          <RadialGradient id="bubbleShine" cx="35%" cy="35%" r="30%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </RadialGradient>
          
          {/* Shadow gradient */}
          <RadialGradient id="bubbleShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="70%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </RadialGradient>
        </Defs>
        
        {/* Shadow */}
        <Circle
          cx="20"
          cy="22"
          r="18"
          fill="url(#bubbleShadow)"
        />
        
        {/* Main bubble body */}
        <Circle
          cx="20"
          cy="20"
          r="16"
          fill="url(#bubbleGradient)"
          stroke={theme.colors.highlight}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        
        {/* Top shine highlight */}
        <Ellipse
          cx="16"
          cy="16"
          rx="6"
          ry="4"
          fill="url(#bubbleShine)"
        />
        
        {/* Secondary smaller shine */}
        <Circle
          cx="14"
          cy="14"
          r="2"
          fill="#ffffff"
          fillOpacity="0.6"
        />
      </Svg>
    </Animated.View>
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
  
  // Only show active second - hide inactive seconds
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate distance to this second (handles wraparound)
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    // Hide all inactive seconds - only show current second
    let opacity = 0.0; // Hide by default
    let scale = 1.0;
    
    // Only show current second (encapsulated by bubble)
    if (circularDiff <= 0.5) {
      const proximity = 1 - (circularDiff / 0.5);
      opacity = proximity; // 0.0 to 1.0 - fully visible only when active
      scale = 1.0 + proximity * 0.1; // Subtle scale boost
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

  // Subtle color transition for encapsulated number
  const textAnimatedStyle = useAnimatedStyle(() => {
    const rawDiff = Math.abs(continuousTime.value - second);
    const circularDiff = Math.min(rawDiff, 60 - rawDiff);
    
    let color = theme.colors.text;
    
    // Enhance current second color (inside bubble)
    if (circularDiff <= 0.5) {
      const proximity = 1 - (circularDiff / 0.5);
      color = interpolateColor(
        proximity,
        [0, 1],
        [theme.colors.text, theme.colors.highlight]
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
      
      {/* Water bubble that follows the current second */}
      {settings.animationsEnabled && (
        <WaterBubble 
          continuousTime={continuousTime} 
          theme={theme} 
          secondPositions={secondPositions}
        />
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
  bubbleContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Above numbers but below radius line
  },
  bubbleSvg: {
    position: 'absolute',
  },
  numberContainer: {
    position: 'absolute',
    width: 20, // Smaller container to prevent overlap
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Above bubble
  },
  number: {
    textAlign: 'center',
    fontSize: 12, // Smaller font for inactive seconds
    lineHeight: 14,
    fontWeight: '400',
  },
});