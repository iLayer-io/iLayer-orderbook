import { ActiveCard, Direction } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  GridItem,
  Group,
  Highlight,
  IconButton,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { IoTrash } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import { useSwapContext } from "@/contexts/SwapContext";
import { PiCaretDownBold } from "react-icons/pi";
import { useConfig } from "@/contexts/ConfigContext";

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
  const { getNetworkIcon } = useConfig();

  return (
    <>
      <Card.Root variant={"outline"}>
        <Card.Title fontSize={"sm"} p={3} pb={0}>
          <Box
            display={"flex"}
            alignItems={"center"}
            onClick={() => setActiveCard(ActiveCard.IOInput)}
            cursor="pointer"
          >
            <Text mr={1}>From</Text>

            <Avatar.Root mr={1} h={4} w={4}>
              <Avatar.Image
                src={`networks/${getNetworkIcon(swapData.input.network)}`}
              />
            </Avatar.Root>
            <Highlight
              query={swapData.input.network}
              styles={{ color: "teal.600" }}
            >
              {swapData.input.network}
            </Highlight>
          </Box>
        </Card.Title>
        <Card.Body p={3} pr={0} mx={2}>
          {swapData.input.tokens.map((token, idx) => (
            <SimpleGrid columns={6} key={`${token.token.address}-${idx}`}>
              <GridItem colSpan={4}>
                <NumberInputRoot
                  w={"100%"}
                  size={"lg"}
                  min={0}
                  fontWeight={"bold"}
                  variant={"ilayer"}
                >
                  <NumberInputField
                    placeholder="0"
                    value={token.amount || ""}
                    onChange={(e) =>
                      handleInputChange(token.token.name, e.target.value)
                    }
                  />
                </NumberInputRoot>
              </GridItem>
              <GridItem
                colSpan={2}
                display={"flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
              >
                <Group attached>
                  <Button
                    w={"90px"}
                    size={"sm"}
                    fontWeight={"bold"}
                    borderLeftRadius={"xl"}
                    display={"flex"}
                    justifyContent={"space-between"}
                    p={2}
                    onClick={() => setActiveCard(ActiveCard.IOInput)}
                  >
                    <Avatar.Root h={5} w={5}>
                      <Avatar.Image src={`tokens/${token.token.icon}`} />
                    </Avatar.Root>
                    <Flex>{token.token.symbol}</Flex>
                    <Flex></Flex>
                  </Button>
                  {idx > 0 || swapData.input.tokens.length > 1 ? (
                    <IconButton
                      aria-label="Remove Token"
                      size={"sm"}
                      p={0}
                      fontWeight={"bold"}
                      borderLeftColor={"#eee"}
                      borderRightRadius={"xl"}
                      onClick={() => handleRemoveToken(Direction.Input, idx)}
                    >
                      <IoTrash />
                    </IconButton>
                  ) : (
                    <IconButton
                      aria-label="Change Token"
                      size={"sm"}
                      p={0}
                      fontWeight={"bold"}
                      borderLeftColor={"#eee"}
                      borderRightRadius={"xl"}
                      onClick={() => setActiveCard(ActiveCard.IOInput)}
                    >
                      <PiCaretDownBold />
                    </IconButton>
                  )}
                </Group>
              </GridItem>
            </SimpleGrid>
          ))}

          {showAddTokenInput || showAddTokenBoth ? (
            <Button
              w={"100%"}
              mt={2}
              size={"sm"}
              variant={"ghost"}
              onClick={() => setActiveCard(ActiveCard.IOInput)}
            >
              <BsPlus /> Add Token
            </Button>
          ) : null}
        </Card.Body>
      </Card.Root>
    </>
  );
}

