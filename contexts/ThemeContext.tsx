import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

// Shadcn-inspired color palette
const lightColors = {
  // Base colors
  background: '#FFFFFF',
  foreground: '#09090B',
  
  // Card colors
  card: '#FFFFFF',
  cardForeground: '#09090B',
  
  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#09090B',
  
  // Primary colors
  primary: '#18181B',
  primaryForeground: '#FAFAFA',
  
  // Secondary colors
  secondary: '#F4F4F5',
  secondaryForeground: '#18181B',
  
  // Muted colors
  muted: '#F4F4F5',
  mutedForeground: '#71717A',
  
  // Accent colors
  accent: '#F4F4F5',
  accentForeground: '#18181B',
  
  // Destructive colors
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',
  
  // Border & Input
  border: '#E4E4E7',
  input: '#E4E4E7',
  ring: '#18181B',
  
  // Additional semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Text variants
  text: '#09090B',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowMd: 'rgba(0, 0, 0, 0.1)',
  shadowLg: 'rgba(0, 0, 0, 0.15)',
};

const darkColors = {
  // Base colors
  background: '#09090B',
  foreground: '#FAFAFA',
  
  // Card colors
  card: '#09090B',
  cardForeground: '#FAFAFA',
  
  // Popover colors
  popover: '#09090B',
  popoverForeground: '#FAFAFA',
  
  // Primary colors
  primary: '#FAFAFA',
  primaryForeground: '#18181B',
  
  // Secondary colors
  secondary: '#27272A',
  secondaryForeground: '#FAFAFA',
  
  // Muted colors
  muted: '#27272A',
  mutedForeground: '#A1A1AA',
  
  // Accent colors
  accent: '#27272A',
  accentForeground: '#FAFAFA',
  
  // Destructive colors
  destructive: '#7F1D1D',
  destructiveForeground: '#FAFAFA',
  
  // Border & Input
  border: '#27272A',
  input: '#27272A',
  ring: '#D4D4D8',
  
  // Additional semantic colors
  success: '#16A34A',
  warning: '#D97706',
  info: '#2563EB',
  
  // Text variants
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowMd: 'rgba(0, 0, 0, 0.6)',
  shadowLg: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode === 'light' || savedMode === 'dark') {
        setThemeState(savedMode);
      }
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

