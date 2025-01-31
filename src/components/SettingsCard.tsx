import { useState } from "react";
import {
  Card,
  Flex,
  Heading,
  Separator,
  Input,
  IconButton,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { IoClose } from "react-icons/io5";
import { ActiveCard } from "@/types";

interface SettingsCardProps {
  setActiveCard: (card: ActiveCard) => void;
}

export default function SettingsCard({ setActiveCard }: SettingsCardProps) {
  const [isHookEnabled, setIsHookEnabled] = useState(false);

  const handleHookToggle = () => {
    setIsHookEnabled(!isHookEnabled);
  };

  return (
    <Card.Root width="400px" variant="outline" size="sm">
      <Card.Header py={4}>
        <Flex flexDirection="row">
          <Heading>Settings</Heading>
          <IconButton
            aria-label="Close"
            size={"sm"}
            ml={"auto"}
            onClick={() => setActiveCard(ActiveCard.Exchange)}
          >
            <IoClose />
          </IconButton>
        </Flex>
      </Card.Header>
      <Separator />
      <Card.Body gap={2}>
        <Text fontSize="sm" fontWeight="bold">
          Swap Deadline (minutes)
        </Text>
        <NumberInputRoot min={0} size="sm">
          <NumberInputField placeholder="30" />
        </NumberInputRoot>

        <Text fontSize="sm" fontWeight="bold">
          Custom Recipient
        </Text>
        <Input size="sm" placeholder="0x..." />

        <Text fontSize="sm" fontWeight="bold">
          Enable Hook
        </Text>
        <Switch
          size="sm"
          checked={isHookEnabled}
          onCheckedChange={handleHookToggle}
        />

        {isHookEnabled && (
          <>
            <Separator />
            <Text fontSize="sm" mb={2}>
              Call any smart contract with your own parameters
            </Text>

            <Text fontSize="sm" fontWeight="bold">
              Target
            </Text>
            <Input size="sm" placeholder="Contract address (0x...)" />

            <Text fontSize="sm" fontWeight="bold">
              Gas Limit
            </Text>
            <NumberInputRoot min={0} size="sm">
              <NumberInputField placeholder="21000" />
            </NumberInputRoot>

            <Text fontSize="sm" fontWeight="bold">
              Calldata
            </Text>
            <Textarea size="sm" placeholder="Enter calldata here..." />
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
