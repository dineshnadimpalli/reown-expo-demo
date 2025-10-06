import '../polyfills';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider as AppThemeProvider, useTheme as useAppTheme } from '../contexts/ThemeContext';
import { ThemeProvider as ReownThemeProvider } from '@reown/appkit-ui-react-native';
import { WalletProviderTypeProvider } from '../contexts/WalletProviderContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ConditionalProvider } from '../providers/ConditionalProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Component to sync app theme with Reown theme
function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme } = useAppTheme();
  
  return (
    <ReownThemeProvider themeMode={theme}>
      {children}
    </ReownThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <ThemeSync>
          <ToastProvider>
            <WalletProviderTypeProvider>
              <ConditionalProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="transactions" />
                </Stack>
              </ConditionalProvider>
            </WalletProviderTypeProvider>
          </ToastProvider>
        </ThemeSync>
      </AppThemeProvider>
    </ErrorBoundary>
  );
}
