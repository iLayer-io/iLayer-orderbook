import { ActiveCard } from "@/types";
import { Card, Flex, Heading, IconButton } from "@chakra-ui/react";
import { IoCog } from "react-icons/io5";

interface ExchangeHeaderProps {
  setActiveCard: (card: ActiveCard) => void;
}

export default function ExchangeHeader({ setActiveCard }: ExchangeHeaderProps) {
  return (
    <Card.Header py={4}>
      <Flex flexFlow={"row"}>
        <Heading>Swap</Heading>
        <IconButton
          aria-label="Settings"
          size={"sm"}
          ml={"auto"}
          onClick={() => setActiveCard(ActiveCard.Settings)}
        >
          <IoCog />
        </IconButton>
      </Flex>
    </Card.Header>
  );
}
