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
import { useSwitchChain } from "wagmi";

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
  advancedMode: boolean;
  toggleAdvancedMode: () => void;
}

const SwapContext = createContext<SwapContextProps | undefined>(undefined);

interface SwapProviderProps {
  children: ReactNode;
}

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

const calculateDefaultPercentages = (count: number): number[] => {
  if (count === 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 % count;
  return Array(count)
    .fill(base)
    .map((value, idx) => (idx === count - 1 ? value + remainder : value));
};

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
  const { switchChain } = useSwitchChain();

  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const toggleAdvancedMode = useCallback(() => {
    setAdvancedMode((prev) => !prev);
  }, []);

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

  useEffect(() => {
    setSwapData((current) => {
      if (!current || !config) return current;
      const inputNetwork = current.input.network;
      const outputNetwork = current.output.network;
      const inputToken = getFirstToken(inputNetwork, config);
      const outputToken = getFirstToken(outputNetwork, config);
      return {
        input: {
          network: inputNetwork,
          tokens: inputToken ? [{ token: inputToken, amount: 0 }] : [],
        },
        output: {
          network: outputNetwork,
          tokens: outputToken ? [{ token: outputToken, amount: 0 }] : [],
        },
        outputPercentages: calculateDefaultPercentages(outputToken ? 1 : 0),
      };
    });
  }, [advancedMode, config]);

  const inputNetwork = swapData?.input.network;

  useEffect(() => {
    if (inputNetwork) {
      const chainId = getChainIdByNetwork(inputNetwork);
      if (chainId && switchChain) {
        console.log(
          `Switching chain to chainId ${chainId} for network ${inputNetwork}`
        );
        switchChain({ chainId });
      }
    }
  }, [inputNetwork, switchChain]);

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
        advancedMode,
        toggleAdvancedMode,
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
