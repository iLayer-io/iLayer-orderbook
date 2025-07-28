"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Plus, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TokenOrDefiToken, Token, DefiToken, Network, Defi } from "@/types/swap"
import { useConfig } from "@/contexts/ConfigContext"
import { useSwap } from "@/contexts/SwapContext"
import { useSwitchChain } from "wagmi"
import { DialogTitle } from "./ui/dialog"
import { baseUrl } from "@/lib/utils"
import { TokenBalanceSelector } from "./token-balance-selector"

interface TokenSelectorContentProps {
  title: string
  onClose: () => void
  isMobile: boolean
}

// Extended types for UI display with additional properties
type TokenWithDisplay = Token & {
  networkName: string
  networkIcon: string
  balance?: number
}

type DefiTokenWithDisplay = DefiToken & {
  networkName: string
  networkIcon: string
  balance?: number
}

type NetworkDisplay = Network & {
  id: string
}

export default function TokenSelectorContent({
  title,
  onClose,
  isMobile,
}: TokenSelectorContentProps) {
  const { getAllNetworks, getAllDefiProtocols, getTokensByChain, getChainId } = useConfig()
  const { tokenSelector, swapData, selectTokenWithNetworkCheck } = useSwap()
  const { switchChain } = useSwitchChain()

  const [activeTab, setActiveTab] = useState<"token" | "defi">("token")
  const [selectedChain, setSelectedChain] = useState<string>(tokenSelector.type === 'input' ? swapData.input.network : swapData.output.network)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProtocol, setSelectedProtocol] = useState<(Defi & { networkName: string }) | null>()

  // Get networks from config
  const networks: NetworkDisplay[] = getAllNetworks().map(network => ({
    ...network,
    id: network.name
  }))

  // Get filtered tokens based on search and chain selection
  const getFilteredTokens = (): (TokenWithDisplay | DefiTokenWithDisplay)[] => {
    let tokens: (Token & { networkName: string; networkIcon: string })[]

    if (searchQuery) {
      // Search only within the selected chain
      if (selectedChain) {
        const chainTokens = getTokensByChain(selectedChain)
        tokens = chainTokens.filter(token =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      } else {
        tokens = []
      }
    } else if (selectedChain) {
      tokens = getTokensByChain(selectedChain)
    } else {
      tokens = []
    }

    return tokens
  }

  const filteredTokens = getFilteredTokens()

  // Get filtered DeFi protocols based on selected chain and search query
  const getFilteredProtocols = () => {
    let protocols = getAllDefiProtocols()

    // Filter by selected chain
    if (selectedChain) {
      protocols = protocols.filter(protocol => protocol.networkName === selectedChain)
    }

    // Filter by search query
    if (searchQuery) {
      protocols = protocols.filter(protocol =>
        protocol.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return protocols
  }

  const filteredProtocols = getFilteredProtocols()

  const handleProtocolSelect = (protocol: Defi & { networkName: string }) => {
    setSelectedProtocol(protocol)
  }

  const handleBackFromProtocol = () => {
    setSelectedProtocol(null)
  }

  const handleTokenSelect = (token: TokenOrDefiToken) => {
    if (swapData.input.network !== selectedChain) {
      if (tokenSelector.type === 'input') {
        const chainId = getChainId(selectedChain)
        if (chainId && switchChain) {
          try {
            switchChain({ chainId })
            console.log(`Switched to ${selectedChain} (Chain ID: ${chainId}) for input`)
          } catch (error) {
            console.error('Failed to switch chain:', error)
          }
        }
      } else {
        console.log(`Updated output network to ${selectedChain}`)
      }
    }

    selectTokenWithNetworkCheck(token, selectedChain, swapData.advancedMode)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {isMobile ? (
        <DrawerHeader className="text-left border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-zinc-800"
              onClick={selectedProtocol ? handleBackFromProtocol : onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DrawerTitle>{selectedProtocol ? selectedProtocol.name : title}</DrawerTitle>
          </div>
        </DrawerHeader>
      ) : (
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-zinc-800"
            onClick={selectedProtocol ? handleBackFromProtocol : onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-lg font-semibold">{selectedProtocol ? selectedProtocol.name : title}</DialogTitle>
        </div>
      )}

      {!selectedProtocol && (
        <>
          {/* Chain Selector - First line */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto">
              {networks.map((network) => (
                <button
                  key={network.name}
                  onClick={() => setSelectedChain(network.name)}
                  className={`flex-shrink-0 p-2 rounded-full border-2 transition-colors ${selectedChain === network.name ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                    }`}
                >
                  <div className="h-8 w-8 rounded-full flex items-center justify-center">
                    <img src={`${baseUrl}/networks/${network.icon}`} alt={network.name} className="h-6 w-6" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs - Second line */}
          <div className="px-4 pb-2 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "token" | "defi")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value="token" className="text-sm">
                  <div className="h-3 w-3 rounded bg-blue-500 mr-2" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="defi" className="text-sm">
                  <div className="h-3 w-3 rounded bg-purple-500 mr-2" />
                  DeFi
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Bar - Third line */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === "token" ? "Search tokens..." : "Search protocols..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 focus:border-orange-500"
              />
            </div>
          </div>
        </>
      )}

      {/* Fixed Height Scrollable Content */}
      <ScrollArea className="flex-1">
        {selectedProtocol ? (
          /* Protocol Tokens */
          <div className="p-4 pt-0">
            <div className="space-y-2">
              {selectedProtocol.tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <img src={`${baseUrl}/tokens/${token.icon}`} alt={token.symbol} className="h-8 w-8 rounded-full" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : activeTab === "token" ? (
          /* Token List */
          <div className="p-4 pt-0">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">
                  {!selectedChain ? "Select a network above to view available tokens" : "No tokens found"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTokens.map((token) => (
                  <button
                    key={`${token.symbol}-${token.networkName}`}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <img src={`${baseUrl}/tokens/${token.icon}`} alt={token.symbol} className="h-8 w-8 rounded-full" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                      <div className="text-xs text-gray-400">{token.networkName}</div>
                    </div>
                    <TokenBalanceSelector
                      network={token.networkName}
                      tokenSymbol={token.symbol}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* DeFi Protocol List */
          <div className="p-4 pt-0">
            {filteredProtocols.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">
                  {!selectedChain ? "Select a network above to view available protocols" : "No protocols found"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProtocols.map((protocol) => (
                  <button
                    key={`${protocol.name}-${protocol.networkName}`}
                    onClick={() => handleProtocolSelect(protocol)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <img src={`${baseUrl}/protocols/${protocol.icon}`} alt={protocol.name} className="h-8 w-8 rounded-full" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-xs text-gray-400">{protocol.networkName}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
