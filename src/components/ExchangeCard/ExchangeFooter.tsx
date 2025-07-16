import { Button, Card } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useOrderHub } from "@/hooks/useOrderHub";

interface ExchangeFooterProps {
  isSwapValid: () => boolean;
}

export default function ExchangeFooter({ isSwapValid }: ExchangeFooterProps) {
  const account = useAccount();
  const {
    createOrder,
    isPending,
    isError,
    error,
    isSuccess,
    isValidOrder,
    getValidationError
  } = useOrderHub();

  const handleCreateOrder = async () => {
    try {
      await createOrder();
      if (isSuccess) {
        alert("Order created successfully!");
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      alert(`Failed to create order: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const validationError = getValidationError();
  const canCreateOrder = isSwapValid() && isValidOrder() && !isPending;

  return (
    <Card.Footer justifyContent="center" p={4}>
      {account.isConnected ? (
        <>
          <Button
            w={"100%"}
            size={"sm"}
            fontWeight={"bold"}
            disabled={!canCreateOrder}
            onClick={handleCreateOrder}
            loading={isPending}
            title={validationError || undefined}
          >
            {isPending ? "Creating Order..." : "Create Order"}
          </Button>
          {validationError && (
            <div style={{
              color: "orange",
              fontSize: "12px",
              marginTop: "8px",
              textAlign: "center"
            }}>
              {validationError}
            </div>
          )}
          {isError && error && (
            <div style={{
              color: "red",
              fontSize: "12px",
              marginTop: "8px",
              textAlign: "center"
            }}>
              {error.message}
            </div>
          )}
        </>
      ) : (
        <ConnectButton />
      )}
    </Card.Footer>
  );
}
