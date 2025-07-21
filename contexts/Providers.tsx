'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { midnightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../config/wagmi';
import { ConfigProvider } from './ConfigContext';
import { SwapProvider } from './SwapContext';
import { ThemeProvider } from '../components/theme-provider';
import { ContentPairProvider, LightNodeProvider } from "@waku/react";

import '@rainbow-me/rainbowkit/styles.css';
import { CONTENT_TOPIC, LIGHT_NODE_CONFIG } from '@/config/waku';

const queryClient = new QueryClient();

interface ProvidersProps {
    children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={midnightTheme({
                    accentColor: "#ff5000",
                    accentColorForeground: "white",
                    borderRadius: "small",
                })}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ConfigProvider>
                            <SwapProvider>
                                <LightNodeProvider {...LIGHT_NODE_CONFIG}>
                                    <ContentPairProvider contentTopic={CONTENT_TOPIC}>
                                        {children}
                                    </ContentPairProvider>
                                </LightNodeProvider>
                            </SwapProvider>
                        </ConfigProvider>
                    </ThemeProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider >
    );
};
