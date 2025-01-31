import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Flex,
  Heading,
  IconButton,
  Text,
  VStack,
  Box,
  HStack,
  Separator,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { useSwapContext } from "@/contexts/SwapContext";
import { HiOutlineRefresh } from "react-icons/hi";

interface TokenPrice {
  [key: string]: { usd: number };
}

interface Quote {
  solver: string;
  inputTokens: { symbol: string; amount: string }[];
  outputTokens: { symbol: string; amount: string }[];
  inputValueUSD: string;
  outputValueUSD: string;
}

const RATE_LIMIT_INTERVAL = 2000;

export default function QuotesCard() {
  const {
    swapData,
    updateOutputAmount,
    swapData: { outputPercentages },
  } = useSwapContext();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastInputState, setLastInputState] = useState<string>("");

  const generateStateHash = useCallback((): string => {
    const inputState = swapData.input.tokens
      .map((token) => `${token.token.name}:${token.amount}`)
      .join(",");
    const outputState = swapData.output.tokens
      .map((token, idx) => `${token.token.name}:${outputPercentages[idx] || 0}`)
      .join(",");
    return `${inputState}|${outputState}`;
  }, [swapData.input.tokens, swapData.output.tokens, outputPercentages]);

  const shouldFetchQuotes = useCallback((): boolean => {
    const stateHash = generateStateHash();
    const hasZeroAmount = swapData.input.tokens.some(
      (token) => token.amount === 0
    );
    return stateHash !== lastInputState && !hasZeroAmount;
  }, [generateStateHash, swapData.input.tokens, lastInputState]);

  const fetchTokenPrices = useCallback(
    async (ids: string[]): Promise<TokenPrice> => {
      try {
        const idsString = ids.join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`
        );
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching token prices:", error);
        return {};
      }
    },
    []
  );

  const generateQuotes = useCallback(async () => {
    if (!shouldFetchQuotes()) {
      console.warn("Conditions not met for fetching quotes.");
      return;
    }

    try {
      setIsFetching(true);
      const stateHash = generateStateHash();
      setLastInputState(stateHash);

      const inputIds = swapData.input.tokens.map(
        (token) => token.token.coingeckoId
      );
      const outputIds = swapData.output.tokens.map(
        (token) => token.token.coingeckoId
      );

      const prices = await fetchTokenPrices([...inputIds, ...outputIds]);

      const inputTokens = swapData.input.tokens.map((token) => {
        const price = prices[token.token.coingeckoId]?.usd || 0;
        const value = token.amount * price;
        return {
          symbol: token.token.symbol,
          amount: token.amount.toFixed(2),
          value,
        };
      });
      const totalInputValue = inputTokens.reduce(
        (sum, token) => sum + token.value,
        0
      );

      const outputTokens = swapData.output.tokens.map((token, idx) => {
        const price = prices[token.token.coingeckoId]?.usd || 0;
        const percentage = outputPercentages[idx] || 0;
        const estimatedAmount = (totalInputValue * (percentage / 100)) / price;
        return {
          symbol: token.token.symbol,
          amount: estimatedAmount.toFixed(2),
        };
      });

      setQuotes([
        {
          solver: "solver.eth",
          inputTokens,
          outputTokens: outputTokens.map((token) => ({
            ...token,
            amount: (parseFloat(token.amount) * 0.99).toFixed(2),
          })),
          inputValueUSD: totalInputValue.toFixed(2),
          outputValueUSD: (totalInputValue * 0.99).toFixed(2),
        },
        {
          solver: "0xAbC...123",
          inputTokens,
          outputTokens: outputTokens.map((token) => ({
            ...token,
            amount: (parseFloat(token.amount) * 0.98).toFixed(2),
          })),
          inputValueUSD: totalInputValue.toFixed(2),
          outputValueUSD: (totalInputValue * 0.98).toFixed(2),
        },
      ]);
    } catch (error) {
      console.error("Error generating quotes:", error);
    } finally {
      setIsFetching(false);
    }
  }, [
    swapData,
    outputPercentages,
    shouldFetchQuotes,
    fetchTokenPrices,
    setIsFetching,
    setLastInputState,
    setQuotes,
    generateStateHash,
  ]);
  

  const handleSelectQuote = (quote: Quote) => {
    quote.outputTokens.forEach((token) => {
      const correspondingToken = swapData.output.tokens.find(
        (t) => t.token.symbol === token.symbol
      );
      if (correspondingToken) {
        updateOutputAmount(correspondingToken.token, parseFloat(token.amount));
      }
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isFetching) {
        generateQuotes();
      }
    }, RATE_LIMIT_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isFetching, generateQuotes]);

  const hasZeroAmountInput = swapData.input.tokens.some(
    (token) => token.amount === 0
  );

  return (
    <Card.Root width="400px" variant="outline" size="sm" maxH={"70vh"}>
      <Card.Header py={4}>
        <Flex justify="space-between" align="center">
          <Heading>Select a Route</Heading>
          <IconButton
            aria-label="Refresh Quotes"
            size="xs"
            onClick={generateQuotes}
            disabled={isFetching || hasZeroAmountInput}
          >
            <HiOutlineRefresh />
          </IconButton>
        </Flex>
      </Card.Header>
      <Separator />
      <Card.Body overflowY={"scroll"}>
        <VStack gap={2} align="stretch">
          {isFetching || quotes.length === 0
            ? Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} height="80px" />
              ))
            : quotes.map((quote, idx) => (
                <Card.Root
                  key={idx}
                  variant="outline"
                  size="sm"
                  cursor="pointer"
                  onClick={() => handleSelectQuote(quote)}
                >
                  <Card.Body py={2}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontWeight="bold">
                        {quote.solver}
                      </Text>
                      <Box>
                        {idx === 0 && (
                          <Badge
                            bg="teal.600"
                            fontWeight={"bold"}
                            color={"#fff"}
                          >
                            Best
                          </Badge>
                        )}
                      </Box>
                    </Flex>
                  </Card.Body>
                  <Separator />
                  <Card.Body>
                    <HStack justify="space-between" align="flex-start">
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>
                          Input Tokens
                        </Text>
                        {quote.inputTokens.map((token, tokenIdx) => (
                          <Text key={tokenIdx} fontSize="xs">
                            {token.amount} {token.symbol}
                          </Text>
                        ))}
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>
                          Output Tokens
                        </Text>
                        {quote.outputTokens.map((token, tokenIdx) => (
                          <Text key={tokenIdx} fontSize="xs">
                            {token.amount} {token.symbol}
                          </Text>
                        ))}
                      </Box>
                    </HStack>
                  </Card.Body>
                  <Separator />
                  <Card.Body py={2}>
                    <HStack justify="space-between" align="flex-start">
                      <Box>
                        <Text fontSize="xs" fontWeight="bold">
                          Input Value
                        </Text>
                        <Text fontSize="xs">${quote.inputValueUSD}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold">
                          Output Value
                        </Text>
                        <Text fontSize="xs">${quote.outputValueUSD}</Text>
                      </Box>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
