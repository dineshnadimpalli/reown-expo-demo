import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NetworkBadgeProps {
  chainId?: number;
}

const NETWORK_INFO: Record<number, { name: string; color: string; icon: string }> = {
  1: { name: 'Ethereum', color: '#627EEA', icon: 'diamond' },
  11155111: { name: 'Sepolia', color: '#EC7C26', icon: 'flask' },
  137: { name: 'Polygon', color: '#8247E5', icon: 'triangle' },
  42161: { name: 'Arbitrum', color: '#28A0F0', icon: 'layers' },
  10: { name: 'Optimism', color: '#FF0420', icon: 'flash' },
};

export function NetworkBadge({ chainId }: NetworkBadgeProps) {
  const network = chainId ? NETWORK_INFO[chainId] : null;

  if (!network) return null;

  return (
    <View style={[styles.container, { backgroundColor: network.color + '20' }]}>
      <Ionicons name={network.icon as any} size={12} color={network.color} />
      <Text style={[styles.text, { color: network.color }]}>{network.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

