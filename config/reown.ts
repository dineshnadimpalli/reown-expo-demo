import { arbitrum, mainnet, optimism, polygon, sepolia } from 'wagmi/chains';

// Get your Project ID from https://dashboard.reown.com
export const projectId = process.env.EXPO_REOWN_PROJECT_ID;

if (!projectId) {
  console.warn('⚠️ Please get your Project ID from https://dashboard.reown.com');
}

export const metadata = {
  name: 'Reown Wallet Demo',
  description: 'Comprehensive Ethereum wallet connection and transaction testing',
  url: 'https://reown-demo.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'reown-expo-demo://',
  },
};

export const chains = [mainnet, sepolia, polygon, arbitrum, optimism] as const;

export const defaultChain = mainnet;

