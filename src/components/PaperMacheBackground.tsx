import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { 
  Defs, 
  Pattern, 
  Rect, 
  Circle, 
  Ellipse,
  Path,
  Filter,
  FeTurbulence,
  FeColorMatrix,
  FeComposite,
  FeGaussianBlur,
  G,
} from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Seed for consistent random generation
const PAPER_SEED = 42;
let seed = PAPER_SEED;

// Seeded random number generator for consistent results
const seededRandom = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

export const PaperMacheBackground: React.FC = () => {
  const { theme } = useTheme();
  
  // Reset seed to ensure consistent generation
  seed = PAPER_SEED;
  
  // Generate static paper texture using useMemo to ensure it's created once
  const paperTexture = useMemo(() => {
    seed = PAPER_SEED; // Reset seed for consistent generation
    
    // Create base paper texture with noise
    const noiseFilter = (
      <Filter id="paperNoise" x="0%" y="0%" width="100%" height="100%">
        <FeTurbulence 
          baseFrequency="0.9" 
          numOctaves="4" 
          result="noise"
          seed={PAPER_SEED}
        />
        <FeColorMatrix 
          in="noise" 
          type="saturate" 
          values="0"
          result="desaturatedNoise"
        />
        <FeColorMatrix 
          in="desaturatedNoise" 
          type="matrix" 
          values={theme.mode === 'dark' 
            ? "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0"
            : "0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.6 0 0 0 0.12 0"
          }
          result="coloredNoise"
        />
      </Filter>
    );

    // Generate static paper fibers
    const paperFibers = [];
    for (let i = 0; i < 200; i++) {
      const x1 = seededRandom() * width;
      const y1 = seededRandom() * height;
      const length = seededRandom() * 60 + 20;
      const angle = seededRandom() * Math.PI * 2;
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;
      
      const midX = (x1 + x2) / 2 + (seededRandom() - 0.5) * 15;
      const midY = (y1 + y2) / 2 + (seededRandom() - 0.5) * 15;
      
      const opacity = seededRandom() * 0.06 + 0.02;
      const strokeWidth = seededRandom() * 0.8 + 0.2;
      
      paperFibers.push(
        <Path
          key={`fiber-${i}`}
          d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
          stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(139,69,19,0.25)'}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={opacity}
          strokeLinecap="round"
        />
      );
    }

    // Generate paper pulp clusters
    const pulpClusters = [];
    for (let i = 0; i < 80; i++) {
      const x = seededRandom() * width;
      const y = seededRandom() * height;
      const size = seededRandom() * 12 + 3;
      const opacity = seededRandom() * 0.05 + 0.01;
      
      pulpClusters.push(
        <Circle
          key={`pulp-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(210,180,140,0.3)'}
          opacity={opacity}
        />
      );
    }

    // Generate paper grain texture
    const grainTexture = [];
    for (let i = 0; i < 150; i++) {
      const x = seededRandom() * width;
      const y = seededRandom() * height;
      const w = seededRandom() * 4 + 1;
      const h = seededRandom() * 2 + 0.5;
      const rotation = seededRandom() * 180;
      const opacity = seededRandom() * 0.03 + 0.005;
      
      grainTexture.push(
        <Ellipse
          key={`grain-${i}`}
          cx={x}
          cy={y}
          rx={w}
          ry={h}
          fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(160,130,98,0.2)'}
          opacity={opacity}
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      );
    }

    return {
      noiseFilter,
      paperFibers,
      pulpClusters,
      grainTexture,
    };
  }, [theme.mode]); // Only regenerate when theme mode changes

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Svg width={width} height={height} style={styles.svg}>
        <Defs>
          {paperTexture.noiseFilter}
        </Defs>
        
        {/* Base paper noise texture */}
        <Rect
          width={width}
          height={height}
          filter="url(#paperNoise)"
        />
        
        {/* Paper grain texture layer */}
        <G opacity={0.6}>
          {paperTexture.grainTexture}
        </G>
        
        {/* Paper pulp clusters */}
        <G opacity={0.4}>
          {paperTexture.pulpClusters}
        </G>
        
        {/* Paper fibers overlay */}
        <G opacity={0.8}>
          {paperTexture.paperFibers}
        </G>
        
        {/* Additional subtle paper texture overlay */}
        <Rect
          width={width}
          height={height}
          fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(139,69,19,0.02)'}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  svg: {
    position: 'absolute',
  },
});