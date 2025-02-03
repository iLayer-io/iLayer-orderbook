export type Token = {
  name: string;
  symbol: string;
  address?: string;
  decimals: number;
  icon: string;
  coingeckoId: string;
};

export type DefiToken = {
  name: string;
  symbol: string;
  address?: string;
  decimals: number;
  icon: string;
  yield: number;
  coingeckoId: string;
};

export type TokenOrDefiToken = Token | DefiToken;

export interface TokenWithAmount {
  token: TokenOrDefiToken;
  amount: number;
}

export type Defi = {
  name: string;
  icon: string;
  tokens: DefiToken[];
};

export type Network = {
  name: string;
  nativeToken: string;
  decimals: number;
  icon: string;
  tokens: Token[];
  defi: Defi[];
};

export type Config = Network[];

export enum Direction {
  Input = "Input",
  Output = "Output",
}

export enum ActiveCard {
  Exchange = "exchange",
  IOInput = "io-input",
  IOOutput = "io-output",
  Settings = "settings",
}
