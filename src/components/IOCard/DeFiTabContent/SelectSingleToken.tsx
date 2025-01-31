import { Card, Grid, GridItem, Avatar, Text } from "@chakra-ui/react";
import { TokenOrDefiToken } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

interface SelectSingleTokenProps {
  tokens: TokenOrDefiToken[];
  selectedTokens: TokenOrDefiToken[];
  updateTokens: (tokens: TokenOrDefiToken[]) => void;
}

const SelectSingleToken = ({
  tokens,
  selectedTokens,
  updateTokens,
}: SelectSingleTokenProps) => {
  useEffect(() => {
    if (tokens.length > 0 && selectedTokens.length === 0) {
      updateTokens([tokens[0]]);
    }
  }, [tokens, selectedTokens, updateTokens]);

  const handleTokenChange = (token: TokenOrDefiToken) => {
    updateTokens([token]);
  };

  return (
    <Card.Body gap={2}>
      <Card.Title fontSize={"xs"}>Select a token</Card.Title>
      {tokens.map((token) => (
        <Checkbox
          key={token.name}
          checked={selectedTokens.some((t) => t.name === token.name)}
          onCheckedChange={() => handleTokenChange(token)}
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
              <Avatar.Root borderless={true} size={"xs"}>
                <Avatar.Image src={`tokens/${token.icon}`} />
              </Avatar.Root>
            </GridItem>
            <GridItem colSpan={6}>
              <Text textStyle="sm">{token.name}</Text>
              <Text textStyle="xs">{token.symbol}</Text>
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

export default SelectSingleToken;
