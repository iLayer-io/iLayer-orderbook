import { Flex, Image, Box } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";

export default function NavBar() {
  return (
    <Box w={"100vw"}>
      <Flex justify={"space-between"} p={10}>
        <Image src="logo.svg" fit="contain" />
        <ColorModeButton size={"xs"} ml={"auto"} />
      </Flex>
    </Box>
  );
}
