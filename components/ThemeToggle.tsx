import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = React.memo(function ThemeToggle() {
  const { theme, setThemeMode, colors } = useTheme();
  const [animation] = React.useState(new Animated.Value(theme === 'dark' ? 1 : 0));
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    Animated.spring(animation, {
      toValue: theme === 'dark' ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [theme, animation]);

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const toggleTheme = () => {
    setThemeMode(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container, 
        { 
          backgroundColor: colors.muted,
          borderColor: colors.border,
        }
      ]}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons 
          name={theme === 'dark' ? 'moon' : 'sunny'} 
          size={20} 
          color={colors.foreground} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

