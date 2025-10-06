import React from 'react';
import { createAppKit, defaultConfig, AppKit } from '@reown/appkit-ethers-react-native';
import { projectId, metadata } from '../config/reown';

// Define chains for Ethers React Native (must be an array)
const ethersChains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://ethereum.publicnode.com',
  },
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
  },
  {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-bor.publicnode.com',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arbitrum-one.publicnode.com',
  },
  {
    chainId: 10,
    name: 'Optimism',
    currency: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://optimism.publicnode.com',
  },
];

// Create config for Ethers
const ethersConfig = defaultConfig({
  metadata
});

// Create AppKit with Ethers
createAppKit({
  projectId,
  metadata,
  chains: ethersChains,
  config: ethersConfig,
  enableAnalytics: true,
  themeMode: 'light'
});

console.log('[EthersProvider] Initialized with projectId:', projectId.slice(0, 8) + '...');

export function EthersProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    console.log('[EthersProvider] Mounted');
    return () => {
      console.log('[EthersProvider] Unmounted');
    };
  }, []);

  return (
    <>
      {children}
      <AppKit />
    </>
  );
}

