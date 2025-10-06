# 🚀 Reown Wallet Demo

A comprehensive, Ethereum wallet connection and transaction testing app built with **Expo**, **React Native**, and **Reown AppKit**.

<div align="center">

![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Wagmi](https://img.shields.io/badge/Wagmi-2.17-8B5CF6?style=for-the-badge)
![Ethers](https://img.shields.io/badge/Ethers-6.15-3B82F6?style=for-the-badge)

</div>

## 📱 Demo

<video src="./assets/demos/reown-expo-demo.mp4" width="100%" controls>
  Your browser does not support the video tag.
</video>

## ✨ Features

### 💼 **Wallet Connection**
- **Reown AppKit v1.3.2** with WalletConnect v2
- Support for **MetaMask**, **Rainbow**, **Trust Wallet**, and more
- Multi-chain: Ethereum, Sepolia, Polygon, Arbitrum, Optimism
- Session persistence & network switching

### 💸 **Transaction Support**
- Native ETH transfers
- ERC20 token transfers
- Message signing
- EIP-712 typed data signing

### 🎨 **Light/Dark Mode**
- ☀️ **Light Mode** / 🌙 **Dark Mode** support
- Smooth theme transitions


---

## 🚀 Quick Start

### 1️⃣ **Get Your Project ID**

Visit [**Reown Dashboard**](https://dashboard.reown.com) and create a new project.

### 2️⃣ **Configure Project ID**

Create a `.env` file in the root directory:

```env
EXPO_REOWN_PROJECT_ID=your_project_id_here
```

Or update `config/reown.ts` directly:

```typescript
export const projectId = process.env.EXPO_REOWN_PROJECT_ID;
```

### 3️⃣ **Install Dependencies**

```bash
pnpm install
```

### 4️⃣ **Run the App**

```bash
# Start Metro bundler
pnpm start

# Run on iOS (macOS only)
pnpm run ios

# Run on Android
pnpm run android
```

---

## 📦 Project Structure

```
reown-expo-demo/
├── 📱 app/                      # Expo Router pages
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Home screen
│   └── transactions.tsx         # Transaction testing
│
├── 🎨 components/               # Reusable components
│   ├── ui/                      # UI primitives
│   │   ├── Button.tsx           # Themed button
│   │   └── Card.tsx             # Themed card
│   └── ThemeToggle.tsx          # Theme switcher
│
├── 🧠 contexts/                 # React contexts
│   ├── ThemeContext.tsx         # Theme management
│   └── WalletProviderContext.tsx # Provider selection
│
├── 🔌 providers/                # AppKit providers
│   ├── WagmiProvider.tsx        # Wagmi setup
│   └── EthersProvider.tsx       # Ethers setup
│
├── ⚙️ config/                   # Configuration
│   └── reown.ts                 # AppKit config
│
├── 🔧 polyfills.ts              # React Native polyfills
└── 📄 metro.config.js           # Metro bundler config
```
---

## 🐛 Troubleshooting

### **Bundling Errors**

If you see module resolution errors:

```bash
# Clear Metro cache
pnpm start -- --clear

# Or reset project
rm -rf node_modules .expo
pnpm install
```

### **Wallet Not Connecting**

- ✅ Verify Project ID is set in environment variables
- ✅ Check internet connection
- ✅ Try a different wallet app
- ✅ Ensure wallet supports WalletConnect v2

### **Transaction Failing**

- ✅ Verify correct network selected
- ✅ Ensure sufficient ETH for gas
- ✅ Check recipient address is valid
- ✅ Try with lower gas limit

---

## 📚 Learn More

### **Reown / WalletConnect**
- [Reown Documentation](https://docs.reown.com)
- [AppKit React Native](https://docs.reown.com/appkit/react-native)

### **Ethereum**
- [Wagmi Docs](https://wagmi.sh)
- [Ethers Docs](https://docs.ethers.org)
- [Ethereum JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712)

### **React Native**
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev)

---

## 📄 License

MIT License - Feel free to use for learning

---

<div align="center">

**Built with ❤️ using Reown AppKit**

</div>
