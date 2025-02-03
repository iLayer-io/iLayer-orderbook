import { useConfig } from "@/contexts/ConfigContext";
import { useSwapContext } from "@/contexts/SwapContext";
import { Direction } from "@/types";
import {
  Card,
  Button,
  Flex,
  Box,
  Highlight,
  Avatar,
  defineStyle,
} from "@chakra-ui/react";
import SelectSingleToken from "./SelectSingleToken";
import SelectMultipleTokens from "./SelectMultipleTokens";
import { useState, useEffect } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const DeFiTabContent = ({ direction }: { direction: Direction }) => {
  const { config } = useConfig();
  const { swapData, updateInputTokens, updateOutputTokens } = useSwapContext();
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const selectedNetwork =
    direction === Direction.Input
      ? swapData.input.network
      : swapData.output.network;

  const selectedTokens =
    direction === Direction.Input
      ? swapData.input.tokens
      : swapData.output.tokens;

  const updateTokens =
    direction === Direction.Input ? updateInputTokens : updateOutputTokens;

  const defiProtocols =
    config?.find((network) => network.name === selectedNetwork)?.defi || [];

  useEffect(() => {
    setSelectedProtocol(null);
  }, [selectedNetwork]);

  const shouldUseSingleToken =
    direction === Direction.Input
      ? swapData.output.tokens.length > 1
      : swapData.input.tokens.length > 1;

  if (selectedProtocol) {
    const protocolTokens =
      defiProtocols.find((protocol) => protocol.name === selectedProtocol)
        ?.tokens || [];

    return (
      <Card.Body gap={2}>
        <Button
          size="sm"
          variant="surface"
          onClick={() => setSelectedProtocol(null)}
        >
          <Flex
            w={"100%"}
            justify={"space-between"}
            alignItems={"center"}
            fontWeight={"bold"}
          >
            <BsArrowLeft /> Back to Protocols <Box />
          </Flex>
        </Button>
        <Card.Title fontSize={"sm"} mt={2}>
          Select Tokens from {selectedProtocol}
        </Card.Title>
        {shouldUseSingleToken ? (
          <SelectSingleToken
            tokens={protocolTokens}
            selectedTokens={selectedTokens.map((t) => t.token)}
            updateTokens={updateTokens}
          />
        ) : (
          <SelectMultipleTokens
            tokens={protocolTokens}
            selectedTokens={selectedTokens.map((t) => t.token)}
            updateTokens={updateTokens}
          />
        )}
      </Card.Body>
    );
  }

  const ringCss = defineStyle({
    outlineWidth: "2px",
    outlineColor: "colorPalette.300",
    outlineStyle: "solid",
  });

  return (
    <Card.Body gap={2}>
      <Card.Title fontSize={"sm"}>
        {defiProtocols.length === 0 ? (
          <Highlight query={selectedNetwork} styles={{ color: "teal.600" }}>
            {`iLayer One Click DeFi is coming soon™ to ${selectedNetwork}`}
          </Highlight>
        ) : (
          "Select a DeFi protocol"
        )}
      </Card.Title>
      {defiProtocols.map((protocol, idx) => (
        <Button
          key={idx}
          w={"100%"}
          size={"sm"}
          variant={"surface"}
          onClick={() => setSelectedProtocol(protocol.name)}
        >
          <Flex justify={"space-between"} alignItems={"center"} w={"100%"}>
            <Avatar.Root h={6} w={6} colorPalette="grey" css={ringCss}>
              <Avatar.Image src={`protocols/${protocol.icon}`} />
            </Avatar.Root>
            <b>{protocol.name}</b> <BsArrowRight />
          </Flex>
        </Button>
      ))}
    </Card.Body>
  );
};

export default DeFiTabContent;
