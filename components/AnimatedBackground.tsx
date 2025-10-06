import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface FloatingOrb {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  size: number;
  color: string;
}

interface GeometricShape {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  size: number;
  color: string;
  shape: 'circle' | 'triangle' | 'square';
}

/**
 * Enhanced AnimatedBackground
 * 
 * Creates a sophisticated animated background with multiple layers:
 * - Base gradient
 * - Floating orbs with rotation
 * - Geometric patterns
 * - Subtle grid overlay
 */
export function AnimatedBackground() {
  const { theme } = useTheme();
  const orbs = useRef<FloatingOrb[]>([]);
  const shapes = useRef<GeometricShape[]>([]);
  const gridOpacity = useRef(new Animated.Value(0.1));

  useEffect(() => {
    // Create floating orbs with rotation
    const orbColors = theme === 'dark' 
      ? [
          'rgba(99, 102, 241, 0.2)',   // Indigo
          'rgba(139, 92, 246, 0.18)',  // Purple
          'rgba(59, 130, 246, 0.16)',  // Blue
          'rgba(236, 72, 153, 0.14)',  // Pink
          'rgba(16, 185, 129, 0.12)',  // Emerald
        ]
      : [
          'rgba(99, 102, 241, 0.1)',   // Indigo
          'rgba(139, 92, 246, 0.08)',  // Purple
          'rgba(59, 130, 246, 0.06)',  // Blue
          'rgba(236, 72, 153, 0.05)',  // Pink
          'rgba(16, 185, 129, 0.04)',  // Emerald
        ];

    orbs.current = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      scale: new Animated.Value(0.5 + Math.random() * 0.8),
      rotation: new Animated.Value(0),
      size: 120 + Math.random() * 180,
      color: orbColors[i % orbColors.length],
    }));

    // Create geometric shapes
    const shapeColors = theme === 'dark'
      ? ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.01)']
      : ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.015)', 'rgba(0, 0, 0, 0.01)'];

    shapes.current = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0.3 + Math.random() * 0.4),
      size: 40 + Math.random() * 80,
      color: shapeColors[i % shapeColors.length],
      shape: ['circle', 'triangle', 'square'][i % 3] as 'circle' | 'triangle' | 'square',
    }));

    // Animate orbs
    orbs.current.forEach((orb) => {
      const animateOrb = () => {
        Animated.parallel([
          Animated.timing(orb.x, {
            toValue: Math.random() * width,
            duration: 20000 + Math.random() * 15000,
            useNativeDriver: true,
          }),
          Animated.timing(orb.y, {
            toValue: Math.random() * height,
            duration: 20000 + Math.random() * 15000,
            useNativeDriver: true,
          }),
          Animated.timing(orb.rotation, {
            toValue: 360,
            duration: 30000 + Math.random() * 20000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(orb.scale, {
              toValue: 0.3 + Math.random() * 0.8,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb.scale, {
              toValue: 0.5 + Math.random() * 0.8,
              duration: 10000,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateOrb());
      };
      animateOrb();
    });

    // Animate geometric shapes
    shapes.current.forEach((shape) => {
      const animateShape = () => {
        Animated.parallel([
          Animated.timing(shape.x, {
            toValue: Math.random() * width,
            duration: 25000 + Math.random() * 20000,
            useNativeDriver: true,
          }),
          Animated.timing(shape.y, {
            toValue: Math.random() * height,
            duration: 25000 + Math.random() * 20000,
            useNativeDriver: true,
          }),
          Animated.timing(shape.rotation, {
            toValue: 180,
            duration: 15000 + Math.random() * 10000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(shape.scale, {
              toValue: 0.1 + Math.random() * 0.5,
              duration: 12000,
              useNativeDriver: true,
            }),
            Animated.timing(shape.scale, {
              toValue: 0.3 + Math.random() * 0.4,
              duration: 12000,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateShape());
      };
      animateShape();
    });

    // Animate grid opacity
    const animateGrid = () => {
      Animated.sequence([
        Animated.timing(gridOpacity.current, {
          toValue: 0.05,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(gridOpacity.current, {
          toValue: 0.15,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]).start(() => animateGrid());
    };
    animateGrid();
  }, [theme]);

  const renderShape = (shape: GeometricShape) => {
    const rotationInterpolated = shape.rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    const shapeStyle = {
      width: shape.size,
      height: shape.size,
      backgroundColor: shape.color,
      transform: [
        { translateX: shape.x },
        { translateY: shape.y },
        { rotate: rotationInterpolated },
        { scale: shape.scale },
      ],
    };

    switch (shape.shape) {
      case 'circle':
        return (
          <Animated.View
            key={shape.id}
            style={[styles.shape, { ...shapeStyle, borderRadius: shape.size / 2 }]}
          />
        );
      case 'triangle':
        return (
          <Animated.View
            key={shape.id}
            style={[styles.triangle, {
              ...shapeStyle,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: shape.size / 2,
              borderRightWidth: shape.size / 2,
              borderBottomWidth: shape.size,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: shape.color,
            }]}
          />
        );
      case 'square':
        return (
          <Animated.View
            key={shape.id}
            style={[styles.shape, { ...shapeStyle, borderRadius: 8 }]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base gradient */}
      <LinearGradient
        colors={theme === 'dark' 
          ? ['#0A0E1A', '#1A1F2E', '#2D3748', '#1A202C'] 
          : ['#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Secondary gradient overlay */}
      <LinearGradient
        colors={theme === 'dark' 
          ? ['rgba(99, 102, 241, 0.1)', 'transparent', 'rgba(139, 92, 246, 0.08)'] 
          : ['rgba(99, 102, 241, 0.05)', 'transparent', 'rgba(139, 92, 246, 0.03)']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Grid pattern */}
      <Animated.View style={[styles.grid, { opacity: gridOpacity.current }]}>
        {Array.from({ length: 20 }, (_, i) => (
          <View key={i} style={[styles.gridLine, { 
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            top: (i * height) / 20,
            width: width,
            height: 1,
          }]} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <View key={i} style={[styles.gridLine, { 
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            left: (i * width) / 15,
            height: height,
            width: 1,
          }]} />
        ))}
      </Animated.View>
      
      {/* Floating orbs */}
      {orbs.current.map((orb) => {
        const rotationInterpolated = orb.rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={orb.id}
            style={[
              styles.orb,
              {
                width: orb.size,
                height: orb.size,
                borderRadius: orb.size / 2,
                backgroundColor: orb.color,
                transform: [
                  { translateX: orb.x },
                  { translateY: orb.y },
                  { scale: orb.scale },
                  { rotate: rotationInterpolated },
                ],
              },
            ]}
          />
        );
      })}
      
      {/* Geometric shapes */}
      {shapes.current.map(renderShape)}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    opacity: 0.6,
  },
  shape: {
    position: 'absolute',
    opacity: 0.4,
  },
  triangle: {
    position: 'absolute',
    opacity: 0.4,
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
  },
});

