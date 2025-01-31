import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Image,
  Input,
  Separator,
  Tabs,
} from "@chakra-ui/react";
import { GiPieChart, GiTwoCoins } from "react-icons/gi";
import { useConfig } from "@/contexts/ConfigContext";
import { ActiveCard, Direction } from "@/types";
import { useSwapContext } from "@/contexts/SwapContext";
import { useState, useEffect } from "react";

import TokensTabContent from "./TokensTabContent";
import DeFiTabContent from "./DeFiTabContent";
import { MdOutlineClose } from "react-icons/md";

interface IOCardProps {
  direction: Direction;
  setActiveCard: (card: ActiveCard) => void;
}

export default function IOCard({ direction, setActiveCard }: IOCardProps) {
  const { config } = useConfig();
  const { swapData, updateInputNetwork, updateOutputNetwork } =
    useSwapContext();
  const [activeTab, setActiveTab] = useState<string>("tokens");

  const handleNetworkChange = (network: string) => {
    if (direction === Direction.Input) {
      updateInputNetwork(network);
    } else if (direction === Direction.Output) {
      updateOutputNetwork(network);
    }
  };

  useEffect(() => {
    setActiveTab("tokens");
  }, [swapData.input.network, swapData.output.network]);

  return (
    <Card.Root width="400px" size={"sm"}>
      <Card.Body gap="2">
        <Flex flexFlow={"row"} justify={"space-between"}>
          <Box>
            {config?.map((network, idx) => {
              const isSelected =
                (direction === Direction.Input &&
                  swapData?.input.network === network.name) ||
                (direction === Direction.Output &&
                  swapData?.output.network === network.name);
              return (
                <IconButton
                  key={idx}
                  aria-label={network.name}
                  size={"sm"}
                  mr={2}
                  variant={isSelected ? "solid" : "surface"}
                  onClick={() => handleNetworkChange(network.name)}
                >
                  <Image
                    src={`networks/${network.icon}`}
                    alt={network.name}
                    fit={"contain"}
                    h={6}
                  />
                </IconButton>
              );
            })}
          </Box>
          <Box>
            <IconButton
              aria-label="close"
              size={"sm"}
              onClick={() => setActiveCard(ActiveCard.Exchange)}
            >
              <MdOutlineClose />
            </IconButton>
          </Box>
        </Flex>
      </Card.Body>
      <Separator />
      <Tabs.Root
        value={activeTab}
        onValueChange={(tab) => setActiveTab(tab.value)}
        variant={"enclosed"}
        fitted
      >
        <Tabs.List>
          <Tabs.Trigger value="tokens">
            <GiTwoCoins />
            Tokens
          </Tabs.Trigger>
          <Tabs.Trigger value="defi">
            <GiPieChart />
            DeFi
          </Tabs.Trigger>
        </Tabs.List>
        <Separator />
        <Tabs.Content value="tokens" p={0}>
          <Flex px={3} pt={3}>
            <Input placeholder="Search token name or paste address" size="sm" />
          </Flex>
          <TokensTabContent direction={direction} />
        </Tabs.Content>
        <Tabs.Content value="defi" p={0}>
          <DeFiTabContent direction={direction} />
        </Tabs.Content>
      </Tabs.Root>
      <Separator />
      <Card.Footer justifyContent="center" p={4}>
        <Button
          w={"100%"}
          size={"sm"}
          fontWeight={"bold"}
          onClick={() => setActiveCard(ActiveCard.Exchange)}
        >
          Confirm {direction}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
