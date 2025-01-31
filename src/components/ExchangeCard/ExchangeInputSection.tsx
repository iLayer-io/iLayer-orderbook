import { ActiveCard, Direction } from "@/types";
import {
  Box,
  Button,
  Card,
  Group,
  Highlight,
  IconButton,
  InputAddon,
} from "@chakra-ui/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { IoTrash } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import { useSwapContext } from "@/contexts/SwapContext";

interface ExchangeInputSectionProps {
  setActiveCard: (card: ActiveCard) => void;
  handleInputChange: (tokenName: string, value: string) => void;
  handleRemoveToken: (direction: Direction, index: number) => void;
  showAddTokenInput: boolean;
  showAddTokenBoth: boolean;
}

export default function ExchangeInputSection({
  setActiveCard,
  handleInputChange,
  handleRemoveToken,
  showAddTokenInput,
  showAddTokenBoth,
}: ExchangeInputSectionProps) {
  const { swapData } = useSwapContext();

  return (
    <>
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
              onClick={() => handleRemoveToken(Direction.Input, idx)}
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
    </>
  );
}
