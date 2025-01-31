"use client";

// import type { Metadata } from "next";
import { Provider as ChackraProvider } from "../components/ui/provider";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { SwapProvider } from "@/contexts/SwapContext";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, arbitrum, optimism } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "iLayer Swap",
  projectId: "ILAYER_SWAP",
  chains: [mainnet, arbitrum, optimism],
  ssr: false,
});

const queryClient = new QueryClient();

// export const metadata: Metadata = {
//   title: "iLayer Swap",
//   description: "Crosschain Swaps.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChackraProvider>
          <ColorModeProvider>
            <ConfigProvider configPath="config.json">
              <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                  <RainbowKitProvider>
                    <SwapProvider>{children}</SwapProvider>
                  </RainbowKitProvider>
                </QueryClientProvider>
              </WagmiProvider>
            </ConfigProvider>
          </ColorModeProvider>
        </ChackraProvider>
      </body>
    </html>
  );
}
