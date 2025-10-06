import { useWalletProvider } from '../contexts/WalletProviderContext';

/**
 * Unified hook for wallet connection that works with both Wagmi and Ethers
 * 
 * Note: Since we can't conditionally call hooks, this hook returns data
 * that should be read based on the current provider type.
 * 
 * For Ethers, use the Reown AppKit hooks directly
 * For Wagmi, use the wagmi hooks directly
 */
export function useWalletConnection() {
  const { providerType } = useWalletProvider();
  
  return {
    providerType,
    // The actual connection data should be retrieved using
    // the appropriate hooks in the components
  };
}

