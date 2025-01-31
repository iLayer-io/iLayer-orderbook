import { Card, Separator } from "@chakra-ui/react";
import { useSwapContext } from "@/contexts/SwapContext";

import { ActiveCard, Direction } from "@/types";
import { useState, useEffect } from "react";
import ExchangeFooter from "./ExchangeFooter";
import ExchangeOutputSection from "./ExchangeOutputSection";
import ExchangeInputSection from "./ExchangeInputSection";
import ExchangeHeader from "./ExchangeHeader";

interface ExchangeCardProps {
  setActiveCard: (card: ActiveCard) => void;
}

export default function ExchangeCard({ setActiveCard }: ExchangeCardProps) {
  const {
    swapData,
    updateInputTokens,
    updateOutputTokens,
    updateInputAmount,
    updateOutputPercentages,
    updateOutputAmount,
  } = useSwapContext();

  const calculateDefaultPercentages = (count: number): number[] => {
    if (count === 0) return [];
    const base = Math.floor(100 / count);
    const remainder = 100 % count;
    return Array(count)
      .fill(base)
      .map((value, idx) => (idx === count - 1 ? value + remainder : value));
  };

  const [outputPercentages, setOutputPercentages] = useState<number[]>(
    calculateDefaultPercentages(swapData.output.tokens.length)
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (outputPercentages.length !== swapData.output.tokens.length) {
      const defaultPercentages = calculateDefaultPercentages(
        swapData.output.tokens.length
      );
      setOutputPercentages(defaultPercentages);
      updateOutputPercentages(defaultPercentages);

      swapData.output.tokens.forEach((token) => {
        updateOutputAmount(token.token, 0);
      });
    }
  }, [
    swapData.output.tokens,
    outputPercentages,
    updateOutputPercentages,
    updateOutputAmount,
  ]);

  const handleRemoveToken = (direction: Direction, index: number) => {
    const tokens =
      direction === Direction.Input
        ? swapData.input.tokens
        : swapData.output.tokens;

    const updatedTokens = tokens.filter((_, i) => i !== index);

    if (direction === Direction.Input) {
      updateInputTokens(updatedTokens.map((t) => t.token));
    } else {
      updateOutputTokens(updatedTokens.map((t) => t.token));

      const updatedPercentages = outputPercentages.filter(
        (_, i) => i !== index
      );
      const redistributedPercentages = calculateDefaultPercentages(
        updatedPercentages.length
      );
      setOutputPercentages(redistributedPercentages);
      updateOutputPercentages(redistributedPercentages);
    }
  };

  const handleInputChange = (tokenName: string, value: string) => {
    const amount = parseFloat(value) || 0;
    const token = swapData.input.tokens.find(
      (t) => t.token.name === tokenName
    )?.token;
    if (token) {
      updateInputAmount(token, amount);
    }
  };

  const handlePercentageChange = (index: number, value: string) => {
    const percentage = Math.max(0, Math.min(100, parseInt(value) || 0));
    const updatedPercentages = [...outputPercentages];
    updatedPercentages[index] = percentage;

    const total = updatedPercentages.reduce((sum, p) => sum + p, 0);

    setOutputPercentages(updatedPercentages);
    if (total === 100) {
      setError(null);
      updateOutputPercentages(updatedPercentages);
    } else {
      setError("The sum of percentages must be exactly 100.");
    }
  };

  const isSwapValid = (): boolean => {
    const allInputAmountsValid = swapData.input.tokens.every(
      (token) => token.amount > 0
    );

    const allOutputAmountsValid = swapData.output.tokens.every(
      (token) => token.amount > 0
    );

    const isPercentageValid =
      outputPercentages.reduce((sum, percentage) => sum + percentage, 0) ===
      100;

    return allInputAmountsValid && allOutputAmountsValid && isPercentageValid;
  };

  const showAddTokenInput =
    swapData.input.tokens.length > 1 && swapData.output.tokens.length === 1;
  const showAddTokenOutput =
    swapData.output.tokens.length > 1 && swapData.input.tokens.length === 1;
  const showAddTokenBoth =
    swapData.input.tokens.length === 1 && swapData.output.tokens.length === 1;

  return (
    <Card.Root width="400px" variant={"outline"} size={"sm"} maxH={"70vh"}>
      <ExchangeHeader setActiveCard={setActiveCard} />
      <Separator />
      <Card.Body gap="2">
        <ExchangeInputSection
          setActiveCard={setActiveCard}
          handleInputChange={handleInputChange}
          handleRemoveToken={handleRemoveToken}
          showAddTokenInput={showAddTokenInput}
          showAddTokenBoth={showAddTokenBoth}
        />

        <ExchangeOutputSection
          setActiveCard={setActiveCard}
          outputPercentages={outputPercentages}
          handlePercentageChange={handlePercentageChange}
          handleRemoveToken={handleRemoveToken}
          showAddTokenOutput={showAddTokenOutput}
          showAddTokenBoth={showAddTokenBoth}
          error={error}
        />
      </Card.Body>
      <Separator />
      <ExchangeFooter isSwapValid={isSwapValid} />
    </Card.Root>
  );
}
