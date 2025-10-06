import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletProvider } from '../contexts/WalletProviderContext';
import { useToast } from '../contexts/ToastContext';
import { useAccount, useSendTransaction, useSignMessage, useSignTypedData, useWriteContract } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit-ethers-react-native';
import { parseEther, parseUnits } from 'viem';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedCard } from '../components/AnimatedCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { WalletButton } from '../components/WalletButton';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

type TransactionType = 'eth-transfer' | 'erc20-transfer' | 'sign-message' | 'sign-typed-data';

const TRANSACTION_CONFIG = {
  'eth-transfer': {
    title: 'ETH Transfer',
    icon: 'send',
    description: 'Send native ETH to any address',
  },
  'erc20-transfer': {
    title: 'ERC20 Transfer',
    icon: 'layers',
    description: 'Transfer ERC20 tokens',
  },
  'sign-message': {
    title: 'Sign Message',
    icon: 'document-text',
    description: 'Sign plain text messages',
  },
  'sign-typed-data': {
    title: 'Sign Typed Data',
    icon: 'finger-print',
    description: 'EIP-712 structured data signatures',
  },
};

/**
 * WagmiTransactions - Transaction handling for Wagmi provider
 */
function WagmiTransactions() {
  const { colors, theme } = useTheme();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  console.log('[WagmiTransactions] isConnected:', isConnected, 'address:', address);
  
  // Ensure we have a valid transaction type
  const paramType = (params.type as string)?.toLowerCase() || 'eth-transfer';
  const transactionType = (TRANSACTION_CONFIG[paramType as TransactionType] 
    ? paramType 
    : 'eth-transfer') as TransactionType;

  const { sendTransactionAsync } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [message, setMessage] = useState('Hello Reown!');

  const config = TRANSACTION_CONFIG[transactionType];

  // Helper function to manage loading state with timeout
  const setLoadingWithTimeout = (isLoading: boolean, timeoutMs: number = 60000) => {
    console.log('[Transaction] setLoadingWithTimeout called:', { isLoading, timeoutMs, currentLoading: loading });
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      console.log('[Transaction] Clearing existing timeout:', loadingTimeoutRef.current);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (isLoading) {
      console.log('[Transaction] Setting loading to true');
      setLoading(true);
      // Set a timeout to prevent loading state from getting stuck
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[Transaction] Loading timeout - resetting loading state');
        setLoading(false);
        showToast('Operation timed out. Please try again.', 'error', 4000);
        loadingTimeoutRef.current = null;
      }, timeoutMs);
      console.log('[Transaction] Timeout set:', loadingTimeoutRef.current);
    } else {
      console.log('[Transaction] Setting loading to false');
      setLoading(false);
    }
  };

  // Error handling utility with proper wallet error codes
  const handleTransactionError = (error: any, operation: string) => {
    console.error(`[${operation}] Error:`, error);
    console.log(`[${operation}] Error code:`, error?.code);
    console.log(`[${operation}] Error message:`, error?.message);
    
    const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred';
    const errorCode = error?.code;
    
    // Check for specific wallet error codes first
    if (errorCode === 4001) {
      // User rejected the transaction (MetaMask standard)
      return { type: 'warning' as const, message: 'Transaction cancelled in wallet' };
    }
    
    if (errorCode === 4100) {
      // Unauthorized (user not connected)
      return { type: 'error' as const, message: 'Wallet not connected' };
    }
    
    if (errorCode === 4200) {
      // Unsupported method
      return { type: 'error' as const, message: 'Unsupported operation' };
    }
    
    if (errorCode === 4900) {
      // Disconnected
      return { type: 'error' as const, message: 'Wallet disconnected' };
    }
    
    if (errorCode === 4901) {
      // Chain disconnected
      return { type: 'error' as const, message: 'Network disconnected' };
    }
    
    // Fallback to message parsing for other wallets
    if (errorMessage.toLowerCase().includes('user rejected') || 
        errorMessage.toLowerCase().includes('user denied') ||
        errorMessage.toLowerCase().includes('cancelled') ||
        errorMessage.toLowerCase().includes('rejected') ||
        errorMessage.toLowerCase().includes('denied') ||
        errorMessage.toLowerCase().includes('user rejected the request') ||
        errorMessage.toLowerCase().includes('user denied transaction signature')) {
      return { type: 'warning' as const, message: 'Transaction cancelled in wallet' };
    }
    
    if (errorMessage.toLowerCase().includes('insufficient funds') || 
        errorMessage.toLowerCase().includes('insufficient balance')) {
      return { type: 'error' as const, message: 'Insufficient balance for transaction' };
    }
    
    if (errorMessage.toLowerCase().includes('gas')) {
      return { type: 'error' as const, message: 'Gas estimation failed. Please try again.' };
    }
    
    if (errorMessage.toLowerCase().includes('invalid address')) {
      return { type: 'error' as const, message: 'Invalid address format' };
    }
    
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('connection')) {
      return { type: 'error' as const, message: 'Network connection error' };
    }
    
    return { type: 'error' as const, message: 'Transaction failed. Please try again.' };
  };

  // Force stop loading state - emergency fallback
  const forceStopLoading = () => {
    console.log('[Transaction] Force stopping loading state - current loading:', loading);
    setLoading(false);
    if (loadingTimeoutRef.current) {
      console.log('[Transaction] Clearing timeout:', loadingTimeoutRef.current);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    console.log('[Transaction] Force stop loading completed');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <AnimatedBackground />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Transactions</Text>
          <View style={styles.headerButtons}>
            <WalletButton />
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.disconnectedContainer}>
          <View style={[styles.disconnectedIcon, { backgroundColor: colors.muted }]}>
            <Ionicons name="wallet-outline" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.disconnectedTitle, { color: colors.text }]}>
            Wallet Not Connected
          </Text>
          <Text style={[styles.disconnectedDesc, { color: colors.mutedForeground }]}>
            Please connect your wallet to use transaction features
          </Text>
          <TouchableOpacity
            style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[styles.backToHomeText, { color: colors.primaryForeground }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleETHTransfer = async () => {
    if (!recipient || !amount) {
      showToast('Please fill in all fields', 'warning', 3000);
      return;
    }

    let loadingStopped = false;

    try {
      setLoadingWithTimeout(true, 30000); // Shorter timeout for user interactions
      console.log('[handleETHTransfer] Starting ETH transfer...');
      
      const hash = await sendTransactionAsync({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
      
      console.log('[handleETHTransfer] Transaction submitted successfully:', hash);
      showToast('ETH transfer submitted successfully!', 'success', 4000);
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.log('[handleETHTransfer] Caught error:', error);
      console.log('[handleETHTransfer] Error code:', error?.code);
      console.log('[handleETHTransfer] Error message:', error?.message);
      
      // Immediately stop loading for user rejections
      const errorCode = error?.code;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Check for user rejection by error code (most reliable)
      if (errorCode === 4001) {
        console.log('[handleETHTransfer] User rejection detected by error code 4001');
        forceStopLoading();
        loadingStopped = true;
      } else if (errorMessage.toLowerCase().includes('user rejected') || 
                 errorMessage.toLowerCase().includes('user denied') ||
                 errorMessage.toLowerCase().includes('cancelled') ||
                 errorMessage.toLowerCase().includes('rejected') ||
                 errorMessage.toLowerCase().includes('denied')) {
        console.log('[handleETHTransfer] User rejection detected by message parsing');
        forceStopLoading();
        loadingStopped = true;
      }
      
      const { type, message } = handleTransactionError(error, 'handleETHTransfer');
      showToast(message, type, 4000);
    } finally {
      // Only call setLoadingWithTimeout if we haven't already stopped loading
      if (!loadingStopped) {
        console.log('[handleETHTransfer] Finally block - stopping loading state');
        setLoadingWithTimeout(false);
      } else {
        console.log('[handleETHTransfer] Finally block - loading already stopped by forceStopLoading');
      }
    }
  };

  const handleERC20Transfer = async () => {
    if (!tokenAddress || !recipient || !amount) {
      showToast('Please fill in all fields', 'warning', 3000);
      return;
    }

    let loadingStopped = false;

    try {
      setLoadingWithTimeout(true, 30000); // Shorter timeout for user interactions
      console.log('[handleERC20Transfer] Starting ERC20 transfer...');
      
      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseUnits(amount, 18)],
      });
      
      console.log('[handleERC20Transfer] Transaction submitted successfully:', hash);
      showToast('ERC20 transfer submitted successfully!', 'success', 4000);
      setTokenAddress('');
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.log('[handleERC20Transfer] Caught error:', error);
      console.log('[handleERC20Transfer] Error code:', error?.code);
      console.log('[handleERC20Transfer] Error message:', error?.message);
      
      // Immediately stop loading for user rejections
      const errorCode = error?.code;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Check for user rejection by error code (most reliable)
      if (errorCode === 4001) {
        console.log('[handleERC20Transfer] User rejection detected by error code 4001');
        forceStopLoading();
        loadingStopped = true;
      } else if (errorMessage.toLowerCase().includes('user rejected') || 
                 errorMessage.toLowerCase().includes('user denied') ||
                 errorMessage.toLowerCase().includes('cancelled') ||
                 errorMessage.toLowerCase().includes('rejected') ||
                 errorMessage.toLowerCase().includes('denied')) {
        console.log('[handleERC20Transfer] User rejection detected by message parsing');
        forceStopLoading();
        loadingStopped = true;
      }
      
      const { type, message } = handleTransactionError(error, 'handleERC20Transfer');
      showToast(message, type, 4000);
    } finally {
      // Only call setLoadingWithTimeout if we haven't already stopped loading
      if (!loadingStopped) {
        console.log('[handleERC20Transfer] Finally block - stopping loading state');
        setLoadingWithTimeout(false);
      } else {
        console.log('[handleERC20Transfer] Finally block - loading already stopped by forceStopLoading');
      }
    }
  };

  const handleSignMessage = async () => {
    if (!message) {
      showToast('Please enter a message', 'warning', 3000);
      return;
    }

    let loadingStopped = false;

    try {
      setLoadingWithTimeout(true, 20000); // Even shorter timeout for signing
      console.log('[handleSignMessage] Attempting to sign message:', message);
      
      const signature = await signMessageAsync({ message });
      console.log('[handleSignMessage] Signature received:', signature);
      
      if (!signature) {
        throw new Error('No signature received from wallet');
      }
      
      showToast('Message signed successfully!', 'success', 3000);
    } catch (error: any) {
      console.log('[handleSignMessage] Caught error:', error);
      console.log('[handleSignMessage] Error code:', error?.code);
      console.log('[handleSignMessage] Error message:', error?.message);
      
      // Immediately stop loading for user rejections
      const errorCode = error?.code;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Check for user rejection by error code (most reliable)
      if (errorCode === 4001) {
        console.log('[handleSignMessage] User rejection detected by error code 4001');
        forceStopLoading();
        loadingStopped = true;
      } else if (errorMessage.toLowerCase().includes('user rejected') || 
                 errorMessage.toLowerCase().includes('user denied') ||
                 errorMessage.toLowerCase().includes('cancelled') ||
                 errorMessage.toLowerCase().includes('rejected') ||
                 errorMessage.toLowerCase().includes('denied')) {
        console.log('[handleSignMessage] User rejection detected by message parsing');
        forceStopLoading();
        loadingStopped = true;
      }
      
      const { type, message } = handleTransactionError(error, 'handleSignMessage');
      showToast(message, type, 4000);
    } finally {
      // Only call setLoadingWithTimeout if we haven't already stopped loading
      if (!loadingStopped) {
        console.log('[handleSignMessage] Finally block - stopping loading state');
        setLoadingWithTimeout(false);
      } else {
        console.log('[handleSignMessage] Finally block - loading already stopped by forceStopLoading');
      }
    }
  };

  const handleSignTypedData = async () => {
    const domain = {
      name: 'Reown Demo',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC' as `0x${string}`,
    };

    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    };

    const value = {
      name: 'Reown User',
      wallet: address as `0x${string}`,
    };

    let loadingStopped = false;

    try {
      setLoadingWithTimeout(true, 20000); // Even shorter timeout for signing
      console.log('[handleSignTypedData] Attempting to sign typed data...');
      
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Person',
        message: value,
      });
      
      console.log('[handleSignTypedData] Signature received:', signature);
      
      if (!signature) {
        throw new Error('No signature received from wallet');
      }
      
      showToast('Typed data signed successfully!', 'success', 3000);
    } catch (error: any) {
      console.log('[handleSignTypedData] Caught error:', error);
      console.log('[handleSignTypedData] Error code:', error?.code);
      console.log('[handleSignTypedData] Error message:', error?.message);
      
      // Immediately stop loading for user rejections
      const errorCode = error?.code;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Check for user rejection by error code (most reliable)
      if (errorCode === 4001) {
        console.log('[handleSignTypedData] User rejection detected by error code 4001');
        forceStopLoading();
        loadingStopped = true;
      } else if (errorMessage.toLowerCase().includes('user rejected') || 
                 errorMessage.toLowerCase().includes('user denied') ||
                 errorMessage.toLowerCase().includes('cancelled') ||
                 errorMessage.toLowerCase().includes('rejected') ||
                 errorMessage.toLowerCase().includes('denied')) {
        console.log('[handleSignTypedData] User rejection detected by message parsing');
        forceStopLoading();
        loadingStopped = true;
      }
      
      const { type, message } = handleTransactionError(error, 'handleSignTypedData');
      showToast(message, type, 4000);
    } finally {
      // Only call setLoadingWithTimeout if we haven't already stopped loading
      if (!loadingStopped) {
        console.log('[handleSignTypedData] Finally block - stopping loading state');
        setLoadingWithTimeout(false);
      } else {
        console.log('[handleSignTypedData] Finally block - loading already stopped by forceStopLoading');
      }
    }
  };

  const renderTransactionForm = () => {
    switch (transactionType) {
      case 'eth-transfer':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Recipient Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="0x..."
                placeholderTextColor={colors.mutedForeground}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Amount (ETH)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="0.01"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleETHTransfer}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="send" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                    Send ETH
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        );

      case 'erc20-transfer':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Token Contract Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="0x..."
                placeholderTextColor={colors.mutedForeground}
                value={tokenAddress}
                onChangeText={setTokenAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Recipient Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="0x..."
                placeholderTextColor={colors.mutedForeground}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="100"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleERC20Transfer}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="layers" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                    Transfer Tokens
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        );

      case 'sign-message':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Message</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Enter message to sign..."
                placeholderTextColor={colors.mutedForeground}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSignMessage}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="document-text" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                    Sign Message
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        );

      case 'sign-typed-data':
        return (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                This will sign structured data (EIP-712) with your current wallet address
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSignTypedData}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="finger-print" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                    Sign Typed Data
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />

      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{config.title}</Text>
        <View style={styles.headerButtons}>
          <WalletButton />
          <ThemeToggle />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <AnimatedCard style={styles.contentCard}>
            <View style={[styles.cardContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                <Ionicons name={config.icon as any} size={32} color={colors.foreground} />
              </View>
              
              <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                {config.title}
              </Text>
              <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
                {config.description}
              </Text>

              <View style={styles.formContainer}>
                {renderTransactionForm()}
              </View>
            </View>
          </AnimatedCard>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * EthersTransactions - Transaction handling for Ethers provider
 */
function EthersTransactions() {
  const { colors, theme } = useTheme();
  const { isConnected, address } = useAppKitAccount();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  console.log('[EthersTransactions] isConnected:', isConnected, 'address:', address);
  
  // Ensure we have a valid transaction type
  const paramType = (params.type as string)?.toLowerCase() || 'eth-transfer';
  const transactionType = (TRANSACTION_CONFIG[paramType as TransactionType] 
    ? paramType 
    : 'eth-transfer') as TransactionType;

  const config = TRANSACTION_CONFIG[transactionType];

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <AnimatedBackground />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Transactions</Text>
          <View style={styles.headerButtons}>
            <WalletButton />
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.disconnectedContainer}>
          <View style={[styles.disconnectedIcon, { backgroundColor: colors.muted }]}>
            <Ionicons name="wallet-outline" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.disconnectedTitle, { color: colors.text }]}>
            Wallet Not Connected
          </Text>
          <Text style={[styles.disconnectedDesc, { color: colors.mutedForeground }]}>
            Please connect your wallet to use transaction features
          </Text>
          <TouchableOpacity
            style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[styles.backToHomeText, { color: colors.primaryForeground }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{config.title}</Text>
          <View style={styles.headerButtons}>
            <WalletButton />
            <ThemeToggle />
          </View>
        </View>

        <AnimatedCard style={styles.contentCard}>
          <View style={[styles.cardContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
              <Ionicons name="diamond" size={48} color={colors.info} />
            </View>
            
            <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
              Ethers Provider Active
            </Text>
            <Text style={[styles.ethersNote, { color: colors.mutedForeground }]}>
              Transaction features for Ethers v6 are available through the AppKit modal. 
              Use the wallet button in the header to access all wallet functions including {config.title.toLowerCase()}.
            </Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={colors.primaryForeground} />
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

/**
 * Main TransactionsScreen component that conditionally renders based on provider
 */
export default function TransactionsScreen() {
  const { providerType } = useWalletProvider();
  
  console.log('[TransactionsScreen] Current provider type:', providerType);
  
  if (providerType === 'wagmi') {
    return <WagmiTransactions />;
  }
  
  return <EthersTransactions />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  // Content Card
  contentCard: {
    marginBottom: 20,
  },
  cardContent: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  button: {
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Disconnected State
  disconnectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  disconnectedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  disconnectedTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  disconnectedDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  ethersNote: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  backToHomeButton: {
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backToHomeText: {
    fontSize: 15,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 40,
  },
});
