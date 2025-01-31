import { Flex, Image, Box } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function NavBar() {
  return (
    <Box w={"100vw"}>
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify={{ base: "center", lg: "space-between" }}
        alignItems={{ base: "center", lg: "space-between" }}
        p={{ base: 6, lg: 10 }}
      >
        <Flex
          alignItems={"space-between"}
          justify={"space-between"}
          mt={{ base: 2, lg: 0 }}
          w={{ base: "100%", lg: "auto" }}
        >
          <Image src="logo.svg" alt="iLayer" fit="contain" w={"150px"} />
          <ColorModeButton
            size={"lg"}
            rounded={"lg"}
            ml={4}
            my={3}
            display={{ base: "block", lg: "none" }}
          />
        </Flex>
        <Flex alignItems={"center"} justify={"center"} mt={{ base: 2, lg: 0 }}>
          <ConnectButton chainStatus="icon" accountStatus="address" />
          <ColorModeButton
            size={"lg"}
            rounded={"lg"}
            ml={4}
            my={3}
            display={{ base: "none", lg: "block" }}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
