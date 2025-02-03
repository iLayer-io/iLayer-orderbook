"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { Config, TokenOrDefiToken, TokenWithAmount } from "@/types";
// Importa il hook per il cambio chain da wagmi
import { useSwitchChain } from "wagmi";

// Definisce la struttura dei dati per lo swap
export interface SwapData {
  network: string;
  tokens: TokenWithAmount[];
}

interface SwapState {
  input: SwapData;
  output: SwapData;
  outputPercentages: number[];
}

interface SwapContextProps {
  swapData: SwapState;
  updateInputNetwork: (network: string) => void;
  updateOutputNetwork: (network: string) => void;
  updateInputTokens: (tokens: TokenOrDefiToken[]) => void;
  updateOutputTokens: (tokens: TokenOrDefiToken[]) => void;
  updateInputAmount: (token: TokenOrDefiToken, amount: number) => void;
  updateOutputAmount: (token: TokenOrDefiToken, amount: number) => void;
  updateOutputPercentages: (percentages: number[]) => void;
  invertSwap: () => void;
}

const SwapContext = createContext<SwapContextProps | undefined>(undefined);

interface SwapProviderProps {
  children: ReactNode;
}

/**
 * Unisce la lista di token esistente con una nuova lista,
 * mantenendo gli importi già impostati (se esistenti).
 */
const mergeTokens = (
  currentTokens: TokenWithAmount[],
  newTokens: TokenOrDefiToken[]
): TokenWithAmount[] => {
  const existingAmounts = new Map(
    currentTokens.map(({ token, amount }) => [token.name, amount])
  );
  return newTokens.map((token) => ({
    token,
    amount: existingAmounts.get(token.name) ?? 0,
  }));
};

/**
 * Calcola le percentuali di default date una quantità di token.
 */
const calculateDefaultPercentages = (count: number): number[] => {
  if (count === 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 % count;
  return Array(count)
    .fill(base)
    .map((value, idx) => (idx === count - 1 ? value + remainder : value));
};

/**
 * Ritorna il primo token disponibile per la rete specificata.
 */
const getFirstToken = (
  networkName: string,
  config: Config
): TokenOrDefiToken | null => {
  const network = config?.find((net) => net.name === networkName);
  if (!network || network.tokens.length === 0) {
    console.warn(`No tokens available for network: ${networkName}`);
    return null;
  }
  return network.tokens[0];
};

/**
 * Mappa il nome della rete al chain ID richiesto dal wallet.
 * La funzione è case-insensitive e supporta:
 * - mainnet/ethereum/ethereum mainnet → 1
 * - polygon → 137
 * - optimism → 10
 * - arbitrum → 42161
 * - base → 8453
 * - avalanche → 43114
 */
const getChainIdByNetwork = (network: string): number | undefined => {
  const net = network.toLowerCase();
  switch (net) {
    case "mainnet":
    case "ethereum":
    case "ethereum mainnet":
      return 1;
    case "polygon":
      return 137;
    case "optimism":
      return 10;
    case "arbitrum":
      return 42161;
    case "base":
      return 8453;
    case "avalanche":
      return 43114;
    default:
      console.warn(`No chain ID mapping for network: ${network}`);
      return undefined;
  }
};

export const SwapProvider: React.FC<SwapProviderProps> = ({ children }) => {
  const { config, loading, error } = useConfig();
  const [swapData, setSwapData] = useState<SwapState | null>(null);

  // Inizializza il hook per cambiare chain
  const { switchChain } = useSwitchChain();

  // Quando il config è disponibile, inizializza lo stato swapData
  useEffect(() => {
    if (config && config.length >= 2) {
      try {
        const inputToken = getFirstToken(config[0].name, config);
        const outputToken = getFirstToken(config[1].name, config);

        setSwapData({
          input: {
            network: config[0].name,
            tokens: inputToken ? [{ token: inputToken, amount: 0 }] : [],
          },
          output: {
            network: config[1].name,
            tokens: outputToken ? [{ token: outputToken, amount: 0 }] : [],
          },
          outputPercentages: calculateDefaultPercentages(outputToken ? 1 : 0),
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [config]);

  // Ogni volta che la rete d'input cambia, tenta di cambiare chain tramite il wallet
  useEffect(() => {
    if (swapData && swapData.input.network) {
      const chainId = getChainIdByNetwork(swapData.input.network);
      if (chainId && switchChain) {
        console.log(
          `Switching chain to chainId ${chainId} for network ${swapData.input.network}`
        );
        switchChain({ chainId });
      }
    }
  }, [swapData?.input.network, switchChain]);

  const updateOutputPercentages = (percentages: number[]) => {
    const total = percentages.reduce((sum, p) => sum + p, 0);
    if (total !== 100) {
      throw new Error("The sum of the percentages must be exactly 100.");
    }
    setSwapData((current) => {
      if (!current) return null;
      return {
        ...current,
        outputPercentages: percentages,
      };
    });
  };

  /**
   * Aggiorna la rete di input e (tramite l'useEffect) innesca il cambio di chain.
   */
  const updateInputNetwork = (network: string) => {
    if (!config) return;
    const firstToken = getFirstToken(network, config);
    setSwapData((current) => {
      if (!current) return null;
      return {
        ...current,
        input: {
          network,
          tokens: firstToken ? [{ token: firstToken, amount: 0 }] : [],
        },
      };
    });
  };

  const updateOutputNetwork = (network: string) => {
    if (!config) return;
    const firstToken = getFirstToken(network, config);
    setSwapData((current) => {
      if (!current) return null;
      return {
        ...current,
        output: {
          network,
          tokens: firstToken ? [{ token: firstToken, amount: 0 }] : [],
        },
        outputPercentages: calculateDefaultPercentages(firstToken ? 1 : 0),
      };
    });
  };

  const updateInputTokens = (tokens: TokenOrDefiToken[]) => {
    setSwapData((current) => {
      if (!current) return null;
      return {
        ...current,
        input: {
          ...current.input,
          tokens: mergeTokens(current.input.tokens, tokens),
        },
      };
    });
  };

  const updateOutputTokens = (tokens: TokenOrDefiToken[]) => {
    setSwapData((current) => {
      if (!current) return null;
      return {
        ...current,
        output: {
          ...current.output,
          tokens: mergeTokens(current.output.tokens, tokens),
        },
        outputPercentages: calculateDefaultPercentages(tokens.length),
      };
    });
  };

  const updateInputAmount = (token: TokenOrDefiToken, amount: number) => {
    setSwapData((current) => {
      if (!current) return null;
      const updatedTokens = current.input.tokens.map((t) =>
        t.token.name === token.name ? { ...t, amount } : t
      );
      return {
        ...current,
        input: {
          ...current.input,
          tokens: updatedTokens,
        },
      };
    });
  };

  const updateOutputAmount = (token: TokenOrDefiToken, amount: number) => {
    setSwapData((current) => {
      if (!current) return null;
      const updatedTokens = current.output.tokens.map((t) =>
        t.token.name === token.name ? { ...t, amount } : t
      );
      return {
        ...current,
        output: {
          ...current.output,
          tokens: updatedTokens,
        },
      };
    });
  };

  const invertSwap = useCallback(() => {
    setSwapData((current) => {
      if (!current) {
        console.error("Swap data is not initialized.");
        return null;
      }
      return {
        input: current.output,
        output: current.input,
        outputPercentages: calculateDefaultPercentages(
          current.input.tokens.length
        ),
      };
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !config || config.length < 2) {
    return (
      <div>Error loading configuration file or insufficient networks.</div>
    );
  }

  if (!swapData) {
    return <div>Initializing swap data...</div>;
  }

  return (
    <SwapContext.Provider
      value={{
        swapData,
        updateInputNetwork,
        updateOutputNetwork,
        updateInputTokens,
        updateOutputTokens,
        updateInputAmount,
        updateOutputAmount,
        updateOutputPercentages,
        invertSwap,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwapContext = (): SwapContextProps => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error("useSwapContext must be used within a SwapProvider");
  }
  return context;
};
