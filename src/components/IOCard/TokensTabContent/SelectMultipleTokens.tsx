import { Card, Grid, GridItem, Avatar, Text } from "@chakra-ui/react";
import { TokenOrDefiToken } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectMultipleTokensProps {
  tokens: TokenOrDefiToken[];
  selectedTokens: TokenOrDefiToken[];
  updateTokens: (tokens: TokenOrDefiToken[]) => void;
}

const SelectMultipleTokens = ({
  tokens,
  selectedTokens,
  updateTokens,
}: SelectMultipleTokensProps) => {
  const handleTokenChange = (
    token: TokenOrDefiToken,
    checked: boolean | string
  ) => {
    const updatedTokens = checked
      ? [...selectedTokens, token]
      : selectedTokens.filter((t) => t.name !== token.name);

    updateTokens(updatedTokens);
  };

  return (
    <Card.Body gap={2}>
      <Card.Title fontSize={"sm"}>Select at least one token</Card.Title>
      {tokens.map((token, idx) => (
        <Checkbox
          key={idx}
          checked={selectedTokens.some((t) => t.name === token.name)}
          onCheckedChange={(e) => handleTokenChange(token, e.checked)}
          w={"100%"}
          size={"sm"}
          my={1}
        >
          <Grid templateColumns="repeat(8, 1fr)" gap="2">
            <GridItem
              colSpan={1}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Avatar.Root borderless={true} size={"sm"}>
                <Avatar.Image src={`tokens/${token.icon}`} />
              </Avatar.Root>
            </GridItem>
            <GridItem colSpan={6}>
              <Text textStyle="sm" fontWeight={"bold"}>
                {token.symbol}
              </Text>
              <Text textStyle="xs">{token.name}</Text>
            </GridItem>
            <GridItem colSpan={1}>
              <Text textStyle="sm">
                {token.address
                  ? `${token.address.slice(0, 5)}...${token.address.slice(-3)}`
                  : "N/A"}
              </Text>
            </GridItem>
          </Grid>
        </Checkbox>
      ))}
    </Card.Body>
  );
};

export default SelectMultipleTokens;
