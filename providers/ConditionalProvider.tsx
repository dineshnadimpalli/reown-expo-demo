import React from 'react';
import { WagmiProvider } from './WagmiProvider';

/**
 * ConditionalProvider
 * 
 * Only using Wagmi for now - will add Ethers back later
 */
export function ConditionalProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProvider>{children}</WagmiProvider>;
}

