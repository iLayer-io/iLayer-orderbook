import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  arbitrum,
  optimism,
  base,
  polygon,
  avalanche
} from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'iLayer Orderbook',
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, arbitrum, optimism, base, polygon, avalanche],
  ssr: true
});
