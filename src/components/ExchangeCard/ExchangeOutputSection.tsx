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
  SimpleGrid,
  Text,
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
  const { swapData, advancedMode } = useSwapContext();
  const { getNetworkIcon } = useConfig();

  return (
    <>
      <Card.Root variant={"outline"}>
        <Card.Title fontSize={"sm"} p={3} pb={0}>
          <Box
            display={"flex"}
            alignItems={"center"}
            onClick={() => setActiveCard(ActiveCard.IOOutput)}
            cursor="pointer"
          >
            <Text mr={1}>To</Text>
            <Avatar.Root mr={1} h={4} w={4}>
              <Avatar.Image
                src={`networks/${getNetworkIcon(swapData.output.network)}`}
              />
            </Avatar.Root>
            <Highlight
              query={swapData.output.network}
              styles={{ color: "teal.600" }}
            >
              {swapData.output.network}
            </Highlight>
          </Box>
        </Card.Title>
        <Card.Body p={3} pr={0} mx={2}>
          {swapData.output.tokens.map((token, idx) => (
            <SimpleGrid columns={10} key={`${token.token.address}-${idx}`}>
              <GridItem colSpan={swapData.output.tokens.length > 1 ? 4 : 6}>
                <NumberInputRoot
                  w={"100%"}
                  size={"lg"}
                  min={0}
                  fontWeight={"bold"}
                  variant={"ilayer"}
                  disabled
                >
                  <NumberInputField
                    placeholder="0"
                    value={token.amount || ""}
                  />
                </NumberInputRoot>
              </GridItem>
              {swapData.output.tokens.length > 1 && (
                <GridItem colSpan={2}>
                  <Flex alignItems={"center"}>
                    <Text mr={1} fontWeight={"bold"}>
                      %
                    </Text>
                    <NumberInputRoot
                      w={"100%"}
                      size={"lg"}
                      min={0}
                      fontWeight={"bold"}
                      variant={"ilayer"}
                    >
                      <NumberInputField
                        placeholder="0"
                        value={outputPercentages[idx] || ""}
                        onChange={(e) =>
                          handlePercentageChange(idx, e.target.value)
                        }
                      />
                    </NumberInputRoot>
                  </Flex>
                </GridItem>
              )}
              <GridItem
                colSpan={4}
                display={"flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
              >
                <Group attached>
                  <Button
                    w={"90px"}
                    p={2}
                    size={"sm"}
                    fontWeight={"bold"}
                    borderRadius={"xl"}
                    display={"flex"}
                    justifyContent={"space-between"}
                    onClick={() => setActiveCard(ActiveCard.IOOutput)}
                  >
                    <Avatar.Root h={5} w={5}>
                      <Avatar.Image src={`tokens/${token.token.icon}`} />
                    </Avatar.Root>
                    <Flex>{token.token.symbol}</Flex>
                    <Flex></Flex>
                  </Button>
                  {idx > 0 || swapData.output.tokens.length > 1 ? (
                    <IconButton
                      aria-label="Remove Token"
                      size={"sm"}
                      p={0}
                      fontWeight={"bold"}
                      borderLeftColor={"#eee"}
                      borderRightRadius={"xl"}
                      onClick={() => handleRemoveToken(Direction.Output, idx)}
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
                      onClick={() => setActiveCard(ActiveCard.IOOutput)}
                    >
                      <PiCaretDownBold />
                    </IconButton>
                  )}
                </Group>
              </GridItem>
            </SimpleGrid>
          ))}

          {advancedMode && (showAddTokenOutput || showAddTokenBoth) ? (
            <Button
              w={"100%"}
              mt={2}
              size={"sm"}
              variant={"ghost"}
              onClick={() => setActiveCard(ActiveCard.IOOutput)}
            >
              <BsPlus /> Add Token
            </Button>
          ) : null}

          {error && (
            <Text fontSize="sm" color="red.600" mt={2}>
              {error}
            </Text>
          )}
        </Card.Body>
      </Card.Root>
    </>
  );
}
