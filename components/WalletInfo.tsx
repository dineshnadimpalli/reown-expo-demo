import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { AccountController } from '@reown/appkit-core-react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * WalletInfo component that shows wallet details when connected
 * Includes copy address functionality since Reown modal doesn't have it
 */
export function WalletInfo() {
  const { colors } = useTheme();
  const { address } = useAccount();
  const { open } = useAppKit();
  const [copied, setCopied] = useState(false);
  const [accountState, setAccountState] = useState(AccountController.state);

  // Subscribe to AccountController state changes for more reliable connection status
  useEffect(() => {
    const unsubscribe = AccountController.subscribeKey('isConnected', (isConnected) => {
      setAccountState(prev => ({ ...prev, isConnected }));
    });

    const unsubscribeAddress = AccountController.subscribeKey('address', (address) => {
      setAccountState(prev => ({ ...prev, address }));
    });

    return () => {
      unsubscribe();
      unsubscribeAddress();
    };
  }, []);

  // Use AccountController state for more reliable connection status
  const isConnected = accountState.isConnected && accountState.address;
  const currentAddress = accountState.address || address;

  const handleCopyAddress = async () => {
    if (!currentAddress) return;
    
    try {
      await Clipboard.setStringAsync(currentAddress);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[WalletInfo] Failed to copy address:', error);
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  // Only show if truly connected with a valid address
  if (!isConnected || !currentAddress) {
    return null;
  }

  const shortAddress = `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={()=>{}}
        style={styles.walletSection}
        activeOpacity={0.7}
      >
        <View style={[styles.walletIcon, { backgroundColor: colors.muted }]}>
          <Ionicons name="wallet" size={16} color={colors.foreground} />
        </View>
        <View style={styles.walletInfo}>
          <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>Wallet</Text>
          <Text style={[styles.walletAddress, { color: colors.foreground }]}>{shortAddress}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleCopyAddress}
        style={[styles.copyButton, { backgroundColor: colors.muted }]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={copied ? 'checkmark' : 'copy'} 
          size={16} 
          color={copied ? colors.success : colors.foreground} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walletSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});