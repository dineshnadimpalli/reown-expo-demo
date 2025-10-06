import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WalletAvatarProps {
  address: string;
  size?: number;
}

/**
 * Generates a deterministic color palette from wallet address
 */
const generateColors = (address: string): string[] => {
  const hash = address.slice(2, 8);
  const hue1 = parseInt(hash.slice(0, 2), 16);
  const hue2 = (hue1 + 60) % 360;
  
  return [
    `hsl(${hue1}, 70%, 60%)`,
    `hsl(${hue2}, 70%, 50%)`,
  ];
};

/**
 * WalletAvatar
 * 
 * Creates a beautiful identicon based on wallet address
 */
export function WalletAvatar({ address, size = 48 }: WalletAvatarProps) {
  const colors = generateColors(address);
  const initials = `${address[2]}${address[3]}`.toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

