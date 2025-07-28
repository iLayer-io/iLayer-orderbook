import { Address } from 'viem';

export type Token = {
  name: string;
  symbol: string;
  address?: Address;
  decimals: number;
  icon: string;
  coingeckoId: string;
};

export type DefiToken = {
  name: string;
  symbol: string;
  address?: Address;
  decimals: number;
  icon: string;
  yield: number;
  coingeckoId: string;
};

export type TokenOrDefiToken = Token | DefiToken;

export interface Quote {
  id: string;
  inputTokens: { address: string; amount: number; symbol: string }[];
  outputTokens: { address: string; amount: number; symbol: string }[];
  network: {
    from: string;
    to: string;
  };
  isError?: boolean;
  errorMessage?: string;
  source?: string;
}

export interface TokenWithAmount {
  symbol: string;
  amount: string;
}

export type Defi = {
  name: string;
  icon: string;
  tokens: DefiToken[];
};

export type Contracts = {
  hub: string | null;
  spoke: string | null;
  router: string | null;
};

export type Network = {
  name: string;
  nativeToken: string;
  explorerUrl: string;
  decimals: number;
  icon: string;
  chainId: number;
  chainEid?: number;
  contracts?: Contracts;
  tokens: Token[];
  defi: Defi[];
};

export type Config = Network[];

export enum Direction {
  Input = 'Input',
  Output = 'Output'
}

export enum ActiveCard {
  Exchange = 'exchange',
  IOInput = 'io-input',
  IOOutput = 'io-output',
  Settings = 'settings'
}

export interface SwapData {
  network: string;
  tokens: TokenWithAmount[];
}

export interface SwapState {
  input: SwapData;
  output: SwapData;
  outputPercentages: string[];
  advancedMode: boolean;
  selectedQuote: Quote | null;
}

export interface SettingsState {
  swapDeadline?: string; // it's a timestamp in seconds
  customRecipient?: Address;
  enableHook: boolean;
  hookTarget?: `0x${string}`;
  gasLimit?: number;
  calldata?: `0x${string}`;
}

export interface SwapContextProps {
  swapData: SwapState;
  updateInputTokens: (tokens: TokenOrDefiToken[]) => void;
  updateOutputTokens: (tokens: TokenOrDefiToken[]) => void;
  updateInputAmount: (symbol: string, amount: string) => void;
  updateOutputAmount: (symbol: string, amount: string) => void;
  updateOutputPercentages: (index: number, percentage: string) => void;
  invertSwap: () => void;
  advancedMode: boolean;
  toggleAdvancedMode: () => void;
  // Quote state
  selectedQuote: Quote | null;
  setSelectedQuote: (quote: Quote | null) => void;
  // Token selector state
  tokenSelector: {
    isOpen: boolean;
    type: 'input' | 'output';
    editingTokenId: string;
    searchQuery: string;
    activeTab: 'token' | 'defi';
    selectedProtocol: string | null;
  };
  openTokenSelector: (type: 'input' | 'output', tokenId: string) => void;
  closeTokenSelector: () => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'token' | 'defi') => void;
  setSelectedProtocol: (protocolName: string | null) => void;
  selectToken: (token: TokenOrDefiToken) => void;
  selectTokenWithNetworkCheck: (
    token: TokenOrDefiToken,
    tokenNetwork: string,
    advancedMode: boolean
  ) => void;
  addInputToken: () => void;
  addOutputToken: () => void;
  removeInputToken: (tokenId: string) => void;
  removeOutputToken: (tokenId: string) => void;
  updateInputTokenAmount: (tokenId: string, amount: string) => void;
  updateOutputTokenAmount: (tokenId: string, amount: string) => void;
  // Settings state
  settings: SettingsState & { isOpen: boolean };
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (settings: Partial<SettingsState>) => void;
}
