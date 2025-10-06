import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { WalletButton } from '../components/WalletButton';
import { WalletInfo } from '../components/WalletInfo';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedCard } from '../components/AnimatedCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme } = useTheme();

  const features = [
    { 
      icon: 'send', 
      title: 'ETH Transfer', 
      desc: 'Send native ETH'
    },
    { 
      icon: 'layers', 
      title: 'ERC20 Transfer', 
      desc: 'Transfer tokens'
    },
    { 
      icon: 'document-text', 
      title: 'Sign Message', 
      desc: 'Sign text messages'
    },
    { 
      icon: 'finger-print', 
      title: 'Sign Typed Data', 
      desc: 'EIP-712 signatures'
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Animated Background with Floating Orbs */}
      <AnimatedBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Reown</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Web3 Wallet
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <WalletButton />
            <ThemeToggle />
          </View>
        </View>

        {/* Wallet Info - Shows when connected */}
        <WalletInfo />

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Features
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Connect your wallet and start transacting
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                style={styles.featureCard}
                onPress={() => router.push({ pathname: '/transactions', params: { type: feature.title.toLowerCase().replace(/\s+/g, '-') } })}
              >
                <View style={[styles.featureContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.featureIconContainer, { backgroundColor: colors.muted }]}>
                    <Ionicons name={feature.icon as any} size={20} color={colors.foreground} />
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.cardForeground }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                    {feature.desc}
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={colors.mutedForeground} 
                    style={styles.featureArrow} 
                  />
                </View>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.7,
  },

  // Provider Selector
  providerSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  providerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  providerOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Features Section
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionDesc: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
  },
  featureContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  featureArrow: {
    alignSelf: 'flex-end',
  },

  bottomSpacing: {
    height: 40,
  },
});
