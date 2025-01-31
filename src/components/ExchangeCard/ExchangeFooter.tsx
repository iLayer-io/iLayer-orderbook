import { Button, Card } from "@chakra-ui/react";

interface ExchangeFooterProps {
  isSwapValid: () => boolean;
}

export default function ExchangeFooter({ isSwapValid }: ExchangeFooterProps) {
  return (
    <Card.Footer justifyContent="center" p={4}>
      <Button
        w={"100%"}
        size={"xs"}
        fontWeight={"bold"}
        disabled={!isSwapValid()}
        onClick={() => alert("Thank you for having tried out the iLayer demo!")}
      >
        Review Order
      </Button>
    </Card.Footer>
  );
}
