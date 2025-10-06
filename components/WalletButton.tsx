import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { AccountController } from '@reown/appkit-core-react-native';

/**
 * Simple WalletButton with wallet icon
 */
export function WalletButton() {
  const { colors } = useTheme();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  
  const handlePress = () => {
    console.log('[WalletButton] Button pressed, isConnected:', isConnected);
    const profileImageUrl = 'https://pbs.twimg.com/profile_images/1832911695947223040/uStftanD_400x400.jpg';
    AccountController.setProfileImage(profileImageUrl); 
    setTimeout(() => {
      open();
    }, 100);
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: colors.muted,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isConnected ? 'wallet' : 'wallet-outline'}
        size={20}
        color={colors.foreground}
      />
    </TouchableOpacity>
  );
}

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

