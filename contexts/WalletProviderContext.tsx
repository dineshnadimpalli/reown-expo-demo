import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProviderType = 'wagmi' | 'ethers';

interface WalletProviderContextType {
  providerType: ProviderType;
  setProviderType: (type: ProviderType) => void;
}

const WalletProviderContext = createContext<WalletProviderContextType | undefined>(undefined);

const PROVIDER_STORAGE_KEY = '@wallet_provider_type';

export function WalletProviderTypeProvider({ children }: { children: React.ReactNode }) {
  const [providerType, setProviderTypeState] = useState<ProviderType>('wagmi');

  // Load saved provider preference
  useEffect(() => {
    AsyncStorage.getItem(PROVIDER_STORAGE_KEY).then((savedType) => {
      if (savedType === 'wagmi' || savedType === 'ethers') {
        setProviderTypeState(savedType);
      }
    });
  }, []);

  const setProviderType = async (type: ProviderType) => {
    console.log('[WalletProviderTypeProvider] Switching from', providerType, 'to', type);
    setProviderTypeState(type);
    await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, type);
  };

  return (
    <WalletProviderContext.Provider value={{ providerType, setProviderType }}>
      {children}
    </WalletProviderContext.Provider>
  );
}

export function useWalletProvider() {
  const context = useContext(WalletProviderContext);
  if (context === undefined) {
    throw new Error('useWalletProvider must be used within a WalletProviderTypeProvider');
  }
  return context;
}

