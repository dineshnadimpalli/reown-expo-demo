import React, { useState } from 'react';
import { defaultWagmiConfig, AppKit, createAppKit } from '@reown/appkit-wagmi-react-native';
import { WagmiProvider as WagmiProviderLib } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectId, metadata, chains } from '../config/reown';
import { ThemeController, AccountController } from '@reown/appkit-core-react-native';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

// Create QueryClient with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create wagmiConfig
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// Theme-aware AppKit component that recreates the modal when theme changes
function DynamicAppKit() {
  const { theme } = useAppTheme();
  
  React.useEffect(() => {
    // Update the ThemeController when theme changes
    ThemeController.setThemeMode(theme);
  }, [theme]);
  
  createAppKit({
    projectId,
    metadata,
    wagmiConfig,
    enableAnalytics: true,
    themeMode: theme, // Dynamic theme based on app theme
  });

  return null;
}

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  
  React.useEffect(() => {
    let timeout = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <WagmiProviderLib config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DynamicAppKit />
        {isMounted ? children : null}
        <AppKit />
      </QueryClientProvider>
    </WagmiProviderLib>
  );
}

