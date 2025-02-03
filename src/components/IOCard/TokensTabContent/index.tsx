import { Direction } from "@/types";
import { useConfig } from "@/contexts/ConfigContext";
import { useSwapContext } from "@/contexts/SwapContext";
import SelectSingleToken from "./SelectSingleToken";
import SelectMultipleTokens from "./SelectMultipleTokens";
import { useEffect, useMemo } from "react";

const TokensTabContent = ({ direction }: { direction: Direction }) => {
  const { config } = useConfig();
  const { swapData, updateInputTokens, updateOutputTokens, advancedMode } =
    useSwapContext();

  const selectedNetwork =
    direction === Direction.Input
      ? swapData.input.network
      : swapData.output.network;

  const selectedTokens =
    direction === Direction.Input
      ? swapData.input.tokens.map((t) => t.token)
      : swapData.output.tokens.map((t) => t.token);

  const tokens = useMemo(() => {
    return (
      config?.find((network) => network.name === selectedNetwork)?.tokens || []
    );
  }, [config, selectedNetwork]);

  const updateTokens =
    direction === Direction.Input ? updateInputTokens : updateOutputTokens;

  useEffect(() => {
    if (tokens.length > 0 && selectedTokens.length === 0) {
      updateTokens([tokens[0]]);
    }
  }, [tokens, selectedTokens, updateTokens]);

  const shouldUseSingleToken =
    !advancedMode ||
    (direction === Direction.Input
      ? swapData.output.tokens.length > 1
      : swapData.input.tokens.length > 1);

  if (shouldUseSingleToken) {
    return (
      <SelectSingleToken
        tokens={tokens}
        selectedTokens={selectedTokens}
        updateTokens={updateTokens}
      />
    );
  }

  return (
    <SelectMultipleTokens
      tokens={tokens}
      selectedTokens={selectedTokens}
      updateTokens={updateTokens}
    />
  );
};

export default TokensTabContent;
