import { Button, Card } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface ExchangeFooterProps {
  isSwapValid: () => boolean;
}

export default function ExchangeFooter({ isSwapValid }: ExchangeFooterProps) {
  const account = useAccount();

  return (
    <Card.Footer justifyContent="center" p={4}>
      {account.isConnected ? (
        <Button
          w={"100%"}
          size={"sm"}
          fontWeight={"bold"}
          disabled={!isSwapValid()}
          onClick={() =>
            alert("Thank you for having tried out the iLayer demo!")
          }
        >
          Review Order
        </Button>
      ) : (
        <ConnectButton />
      )}
    </Card.Footer>
  );
}
