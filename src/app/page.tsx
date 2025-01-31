"use client";

import { useState } from "react";
import { Flex } from "@chakra-ui/react";

import Navbar from "@/components/Navbar";
import ExchangeCard from "@/components/ExchangeCard";
import IOCard from "@/components/IOCard";
import SettingsCard from "@/components/SettingsCard";
import { ActiveCard, Direction } from "@/types";
import QuotesCard from "@/components/QuotesCard";

export default function Home() {
  // Stato per gestire la card attiva
  const [activeCard, setActiveCard] = useState<ActiveCard>(ActiveCard.Exchange);

  return (
    <Flex w={"100vw"} h={"100vh"}>
      <Flex flexFlow={"column"} justify={"start"} alignItems={"center"} pb={6}>
        <Navbar />
        <Flex
          direction={{ base: "column", lg: "row" }}
          alignItems={{ base: "center", lg: "flex-start" }}
          gap="4"
          my={10}
        >
          {/* Rendering dinamico basato sullo stato */}
          {activeCard === ActiveCard.Exchange && (
            <ExchangeCard setActiveCard={setActiveCard} />
          )}
          {activeCard === ActiveCard.IOInput && (
            <IOCard direction={Direction.Input} setActiveCard={setActiveCard} />
          )}
          {activeCard === ActiveCard.IOOutput && (
            <IOCard
              direction={Direction.Output}
              setActiveCard={setActiveCard}
            />
          )}
          {activeCard === ActiveCard.Settings && (
            <SettingsCard setActiveCard={setActiveCard} />
          )}
          <QuotesCard />
        </Flex>
      </Flex>
    </Flex>
  );
}
