import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

/**
 * GlassCard
 * 
 * Beautiful glassmorphism card with blur effect
 */
export function GlassCard({ children, style, intensity = 60 }: GlassCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={styles.blur}
      >
        <View style={[styles.content, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)' }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

