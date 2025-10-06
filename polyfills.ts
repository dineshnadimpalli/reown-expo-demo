// ⚠️ CRITICAL: This MUST be the first import!
import '@walletconnect/react-native-compat';

// Import polyfills for React Native
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polyfill for TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Note: WalletConnect session_request errors are typically harmless and occur during
// provider initialization. The proper event listeners in providers will handle them.

