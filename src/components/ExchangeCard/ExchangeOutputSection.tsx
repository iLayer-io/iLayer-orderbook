import { ActiveCard, Direction } from "@/types";
import {
  Box,
  Button,
  Card,
  Group,
  Highlight,
  IconButton,
  InputAddon,
  Text,
} from "@chakra-ui/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { IoTrash } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import { useSwapContext } from "@/contexts/SwapContext";

interface ExchangeOutputSectionProps {
  setActiveCard: (card: ActiveCard) => void;
  outputPercentages: number[];
  handlePercentageChange: (index: number, value: string) => void;
  handleRemoveToken: (direction: Direction, index: number) => void;
  showAddTokenOutput: boolean;
  showAddTokenBoth: boolean;
  error: string | null;
}

export default function ExchangeOutputSection({
  setActiveCard,
  outputPercentages,
  handlePercentageChange,
  handleRemoveToken,
  showAddTokenOutput,
  showAddTokenBoth,
  error,
}: ExchangeOutputSectionProps) {
  const { swapData } = useSwapContext();

  return (
    <>
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
              onClick={() => handleRemoveToken(Direction.Output, idx)}
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
    </>
  );
}
