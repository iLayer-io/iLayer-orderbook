'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { config } from '../config/networks';
import { Config, Network, Token, DefiToken, TokenOrDefiToken, Defi } from '../types/swap';

interface ConfigContextType {
    networks: Config;
    getNetworkByName: (name: string) => Network | undefined;
    getTokensByNetwork: (networkName: string) => Token[];
    getDefiTokensByNetwork: (networkName: string) => DefiToken[];
    getAllNetworkNames: () => string[];
    getTokenBySymbol: (networkName: string, symbol: string) => TokenOrDefiToken | undefined;
    getTokenByChainAndAddress: (networkName: string, address: string) => TokenOrDefiToken | undefined;
    getChainId: (networkName: string) => number | undefined;
    getChainEid: (networkName: string) => number | undefined;
    getCoingeckoId: (networkName: string, symbol: string) => string | undefined;
    getExplorerUrl: (networkName: string) => string | undefined;
    // Metodi per supportare l'UI con le interfacce esistenti
    getAllTokens: () => (Token & { networkName: string; networkIcon: string })[];
    getAllNetworks: () => Network[];
    getAllDefiProtocols: () => (Defi & { networkName: string })[];
    getTokensByChain: (networkName: string | null) => (Token & { networkName: string; networkIcon: string })[];
    searchTokens: (query: string) => (Token & { networkName: string; networkIcon: string })[];
    searchDefiProtocols: (query: string) => (Defi & { networkName: string })[];
    getDefiProtocolByName: (protocolName: string) => (Defi & { networkName: string }) | undefined;
    getHubAddressByNetwork: (networkName: string) => string | null;
    getHubAddressByChainId: (chainId: number) => string | null;
    getRouterAddressByNetwork: (networkName: string) => string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
    children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
    const getHubAddressByNetwork = (networkName: string): string | null => {
        const network = config.find(n => n.name === networkName);
        return network?.contracts?.hub || null;
    };

    const getHubAddressByChainId = (chainId: number): string | null => {
        const network = config.find(n => n.chainId === chainId);
        return network?.contracts?.hub || null;
    };

    const getRouterAddressByNetwork = (networkName: string): string | null => {
        const network = config.find(n => n.name === networkName);
        return network?.contracts?.router || null;
    };

    const getNetworkByName = (name: string): Network | undefined => {
        return config.find(network => network.name === name);
    };

    const getTokensByNetwork = (networkName: string): Token[] => {
        const network = getNetworkByName(networkName);
        return network?.tokens || [];
    };

    const getDefiTokensByNetwork = (networkName: string): DefiToken[] => {
        const network = getNetworkByName(networkName);
        return network?.defi.flatMap(defi => defi.tokens) || [];
    };

    const getAllNetworkNames = (): string[] => {
        return config.map(network => network.name);
    };

    const getTokenBySymbol = (networkName: string, symbol: string): TokenOrDefiToken | undefined => {
        const network = getNetworkByName(networkName);
        if (!network) return undefined;

        // First, look in regular tokens
        const regularToken = network.tokens.find(token => token.symbol === symbol);
        if (regularToken) return regularToken;

        // Then, look in DeFi tokens
        for (const defiProtocol of network.defi) {
            const defiToken = defiProtocol.tokens.find(token => token.symbol === symbol);
            if (defiToken) return defiToken;
        }

        return undefined;
    };

    const getTokenByChainAndAddress = (networkName: string, address: string): TokenOrDefiToken | undefined => {
        const network = getNetworkByName(networkName);
        if (!network) return undefined;

        // Normalizza l'address per la comparazione (lowercase)
        const normalizedAddress = address.toLowerCase();

        // First, look in regular tokens
        const regularToken = network.tokens.find(token =>
            token.address?.toLowerCase() === normalizedAddress
        );
        if (regularToken) return regularToken;

        // Then, look in DeFi tokens
        for (const defiProtocol of network.defi) {
            const defiToken = defiProtocol.tokens.find(token =>
                token.address?.toLowerCase() === normalizedAddress
            );
            if (defiToken) return defiToken;
        }

        return undefined;
    };

    const getCoingeckoId = (networkName: string, symbol: string): string | undefined => {
        const network = getNetworkByName(networkName);
        if (!network) return undefined;

        // First, look in regular tokens
        const regularToken = network.tokens.find(token => token.symbol === symbol);
        if (regularToken?.coingeckoId) return regularToken.coingeckoId;

        // Then, look in DeFi tokens
        for (const defiProtocol of network.defi) {
            const defiToken = defiProtocol.tokens.find(token => token.symbol === symbol);
            if (defiToken?.coingeckoId) return defiToken.coingeckoId;
        }

        return undefined;
    };

    const getExplorerUrl = (networkName: string): string | undefined => {
        const network = getNetworkByName(networkName);
        return network?.explorerUrl;
    };

    const getAllTokens = (): (Token & { networkName: string; networkIcon: string })[] => {
        const allTokens: (Token & { networkName: string; networkIcon: string })[] = [];

        config.forEach(network => {
            network.tokens.forEach(token => {
                allTokens.push({
                    ...token,
                    networkName: network.name,
                    networkIcon: network.icon,
                });
            });
        });

        return allTokens;
    };

    const getAllNetworks = (): Network[] => {
        return config;
    };

    const getAllDefiProtocols = (): (Defi & { networkName: string })[] => {
        const protocols: (Defi & { networkName: string })[] = [];

        config.forEach(network => {
            network.defi.forEach(defiProtocol => {
                protocols.push({
                    ...defiProtocol,
                    networkName: network.name,
                });
            });
        });

        return protocols;
    };

    const getTokensByChain = (networkName: string | null): (Token & { networkName: string; networkIcon: string })[] => {
        if (!networkName) return getAllTokens();

        const network = getNetworkByName(networkName);
        if (!network) return [];

        return network.tokens.map(token => ({
            ...token,
            networkName: network.name,
            networkIcon: network.icon,
        }));
    };

    const searchTokens = (query: string): (Token & { networkName: string; networkIcon: string })[] => {
        if (!query) return getAllTokens();
        const lowerQuery = query.toLowerCase();
        return getAllTokens().filter(token =>
            token.name.toLowerCase().includes(lowerQuery) ||
            token.symbol.toLowerCase().includes(lowerQuery)
        );
    };

    const searchDefiProtocols = (query: string): (Defi & { networkName: string })[] => {
        if (!query) return getAllDefiProtocols();
        const lowerQuery = query.toLowerCase();
        return getAllDefiProtocols().filter(protocol =>
            protocol.name.toLowerCase().includes(lowerQuery)
        );
    };

    const getDefiProtocolByName = (protocolName: string): (Defi & { networkName: string }) | undefined => {
        return getAllDefiProtocols().find(protocol => protocol.name === protocolName);
    };

    const getChainId = (networkName: string): number | undefined => {
        const network = getNetworkByName(networkName);
        return network?.chainId;
    };

    const getChainEid = (networkName: string): number | undefined => {
        const network = getNetworkByName(networkName);
        return network?.chainEid;
    };


    const value: ConfigContextType = {
        networks: config,
        getChainEid,
        getRouterAddressByNetwork,
        getHubAddressByChainId,
        getHubAddressByNetwork,
        getNetworkByName,
        getTokensByNetwork,
        getDefiTokensByNetwork,
        getAllNetworkNames,
        getTokenBySymbol,
        getTokenByChainAndAddress,
        getChainId,
        getCoingeckoId,
        getExplorerUrl,
        getAllTokens,
        getAllNetworks,
        getAllDefiProtocols,
        getTokensByChain,
        searchTokens,
        searchDefiProtocols,
        getDefiProtocolByName,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};