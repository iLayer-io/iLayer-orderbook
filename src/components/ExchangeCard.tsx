import {
  Card,
  Flex,
  Heading,
  IconButton,
  Separator,
  Button,
  InputAddon,
  Highlight,
  Group,
  Box,
  Text,
} from "@chakra-ui/react";
import { useSwapContext } from "@/contexts/SwapContext";

import { IoCog, IoTrash } from "react-icons/io5";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { BsPlus } from "react-icons/bs";
import { ActiveCard } from "@/types";
import { useState, useEffect } from "react";

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

  const handleRemoveToken = (direction: "input" | "output", index: number) => {
    const tokens =
      direction === "input" ? swapData.input.tokens : swapData.output.tokens;

    const updatedTokens = tokens.filter((_, i) => i !== index);

    if (direction === "input") {
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
      <Card.Header py={4}>
        <Flex flexFlow={"row"}>
          <Heading>Exchange</Heading>
          <IconButton
            aria-label="Settings"
            size={"xs"}
            ml={"auto"}
            onClick={() => setActiveCard(ActiveCard.Settings)}
          >
            <IoCog />
          </IconButton>
        </Flex>
      </Card.Header>
      <Separator />
      <Card.Body gap="2" overflowY={"scroll"}>
        {/* Input Section */}
        <Card.Title fontSize={"xs"}>
          <Box
            as="span"
            onClick={() => setActiveCard(ActiveCard.IOInput)}
            cursor="pointer"
          >
            <Highlight
              query={swapData.input.network}
              styles={{ color: "teal.600" }}
            >
              {`From ${swapData.input.network}`}
            </Highlight>
          </Box>
        </Card.Title>
        {swapData.input.tokens.map((token, idx) => (
          <Group attached key={`${token.token.address}-${idx}`}>
            <InputAddon
              fontWeight={"bold"}
              onClick={() => setActiveCard(ActiveCard.IOInput)}
              cursor="pointer"
            >
              {token.token.symbol}
            </InputAddon>
            <NumberInputRoot
              w={"100%"}
              size="xs"
              step={0.01}
              min={0}
              spinOnPress={false}
            >
              <NumberInputField
                value={token.amount}
                onChange={(e) =>
                  handleInputChange(token.token.name, e.target.value)
                }
              />
            </NumberInputRoot>
            {(idx > 0 || swapData.input.tokens.length > 1) && (
              <IconButton
                aria-label="Remove Token"
                size={"xs"}
                ml={"auto"}
                onClick={() => handleRemoveToken("input", idx)}
              >
                <IoTrash />
              </IconButton>
            )}
          </Group>
        ))}
        {showAddTokenInput || showAddTokenBoth ? (
          <Button
            w={"100%"}
            size={"xs"}
            variant={"ghost"}
            onClick={() => setActiveCard(ActiveCard.IOInput)}
          >
            <BsPlus /> Add Token
          </Button>
        ) : (
          <Box w="32px" h="32px" ml={"auto"} />
        )}

        {/* Output Section */}
        <Card.Title fontSize={"xs"}>
          <Box
            as="span"
            onClick={() => setActiveCard(ActiveCard.IOOutput)}
            cursor="pointer"
          >
            <Highlight
              query={swapData.output.network}
              styles={{ color: "teal.600" }}
            >
              {`To ${swapData.output.network}`}
            </Highlight>
          </Box>
        </Card.Title>
        {swapData.output.tokens.map((token, idx) => (
          <Group attached key={`${token.token.address}-${idx}`}>
            <InputAddon fontWeight={"bold"}>{token.token.symbol}</InputAddon>
            <NumberInputRoot w={"100%"} size="xs" step={0.01} min={0} readOnly>
              <NumberInputField value={token.amount} />
            </NumberInputRoot>
            {swapData.output.tokens.length > 1 && (
              <NumberInputRoot
                w={"120px"}
                size="xs"
                step={1}
                min={0}
                spinOnPress={false}
              >
                <NumberInputField
                  placeholder="%"
                  value={outputPercentages[idx] || 0}
                  onChange={(e) => handlePercentageChange(idx, e.target.value)}
                />
              </NumberInputRoot>
            )}
            {(idx > 0 || swapData.output.tokens.length > 1) && (
              <IconButton
                aria-label="Remove Token"
                size={"xs"}
                ml={"auto"}
                onClick={() => handleRemoveToken("output", idx)}
              >
                <IoTrash />
              </IconButton>
            )}
          </Group>
        ))}
        {showAddTokenOutput || showAddTokenBoth ? (
          <Button
            w={"100%"}
            size={"xs"}
            variant={"ghost"}
            onClick={() => setActiveCard(ActiveCard.IOOutput)}
          >
            <BsPlus /> Add Token
          </Button>
        ) : null}
        {error && (
          <Text fontSize="xs" color="red.600" mt={2}>
            {error}
          </Text>
        )}
      </Card.Body>
      <Separator />
      <Card.Footer justifyContent="center" p={4}>
        <Button
          w={"100%"}
          size={"xs"}
          fontWeight={"bold"}
          disabled={!isSwapValid()}
          onClick={() =>
            alert("Thank you for having tried out the iLayer demo!")
          }
        >
          Review Order
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
