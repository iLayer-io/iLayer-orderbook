"use client"

import { ArrowLeft, Search, Plus, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConfig } from "@/contexts/ConfigContext"
import { useSwap } from "@/contexts/SwapContext"
import type { TokenOrDefiToken, Network, Defi } from "@/types/swap"

interface TokenSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  selectedToken: TokenOrDefiToken | null
  onSelectToken: (token: TokenOrDefiToken) => void
}

export default function TokenSelectorModal({
  isOpen,
  onClose,
  title,
  selectedToken,
  onSelectToken,
}: TokenSelectorModalProps) {
  const {
    getAllNetworks,
    getTokensByChain,
    getAllDefiProtocols,
    searchTokens,
    searchDefiProtocols,
    getDefiProtocolByName
  } = useConfig()

  const { tokenSelector, setSelectedChain, setSearchQuery, setActiveTab, setSelectedProtocol } = useSwap()

  const networks = getAllNetworks()

  // Fix token filtering logic - only show tokens when a chain is selected or there's a search query
  const filteredTokens = tokenSelector.searchQuery
    ? searchTokens(tokenSelector.searchQuery)
    : tokenSelector.selectedChain
      ? getTokensByChain(tokenSelector.selectedChain)
      : [] // Show no tokens when no chain is selected and no search query

  const filteredProtocols = tokenSelector.searchQuery
    ? searchDefiProtocols(tokenSelector.searchQuery)
    : getAllDefiProtocols()

  const selectedProtocolData = tokenSelector.selectedProtocol
    ? getDefiProtocolByName(tokenSelector.selectedProtocol)
    : null

  const handleProtocolSelect = (protocol: Defi & { networkName: string }) => {
    setSelectedProtocol(protocol.name)
  }

  const handleBackFromProtocol = () => {
    setSelectedProtocol(null)
  }

  const handleTokenSelect = (token: TokenOrDefiToken) => {
    onSelectToken(token)
  }

  const handleChainSelect = (networkName: string) => {
    setSelectedChain(tokenSelector.selectedChain === networkName ? null : networkName)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md p-0 gap-0 h-[600px] max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">
          {selectedProtocolData ? selectedProtocolData.name : title}
        </DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-zinc-800"
            onClick={selectedProtocolData ? handleBackFromProtocol : onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{selectedProtocolData ? selectedProtocolData.name : title}</h2>
        </div>

        {!selectedProtocolData && (
          <>
            {/* Tabs */}
            <div className="flex p-4 pb-2 flex-shrink-0">
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("token")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tokenSelector.activeTab === "token" ? "bg-zinc-700 text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                  <div className="h-4 w-4 rounded bg-blue-500" />
                  Token
                </button>
                <button
                  onClick={() => setActiveTab("defi")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tokenSelector.activeTab === "defi" ? "bg-zinc-700 text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                  <div className="h-4 w-4 rounded bg-purple-500" />
                  DeFi
                </button>
              </div>
            </div>

            {/* Network Selector - Only show for Token tab */}
            {tokenSelector.activeTab === "token" && (
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {networks.map((network) => (
                    <button
                      key={network.name}
                      onClick={() => handleChainSelect(network.name)}
                      className={`flex-shrink-0 p-2 rounded-full border-2 transition-colors ${tokenSelector.selectedChain === network.name ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                        }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <img src={`/networks/${network.icon}`} alt={network.name} className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                  <button className="flex-shrink-0 p-2 rounded-full border-2 border-dashed border-zinc-700 hover:border-zinc-600">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={tokenSelector.activeTab === "token" ? "Search tokens..." : "Search protocols..."}
                  value={tokenSelector.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 focus:border-orange-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          {selectedProtocolData ? (
            /* Protocol Tokens */
            <div className="p-4 pt-0">
              <div className="space-y-2">
                {selectedProtocolData.tokens.map((token) => (
                  <button
                    key={`${token.symbol}-${selectedProtocolData.networkName}`}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <img src={`/tokens/${token.icon}`} alt={token.symbol} className="h-8 w-8 rounded-full" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>

                  </button>
                ))}
              </div>
            </div>
          ) : tokenSelector.activeTab === "token" ? (
            /* Token List */
            <div className="p-4 pt-0">
              {!tokenSelector.selectedChain && !tokenSelector.searchQuery ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-sm">Select a network above to view available tokens</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTokens.map((token) => (
                    <button
                      key={`${token.symbol}-${token.networkName}`}
                      onClick={() => handleTokenSelect(token)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <img src={`/tokens/${token.icon}`} alt={token.symbol} className="h-8 w-8 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                        <div className="text-xs text-gray-500">{token.networkName}</div>
                      </div>

                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* DeFi Protocol List */
            <div className="p-4 pt-0">
              {tokenSelector.activeTab === "defi" && !selectedProtocolData && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Select a DeFi protocol</h3>
                </div>
              )}
              <div className="space-y-2">
                {filteredProtocols.map((protocol) => (
                  <button
                    key={`${protocol.name}-${protocol.networkName}`}
                    onClick={() => handleProtocolSelect(protocol)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <img
                      src={`/protocols/${protocol.icon}`}
                      alt={protocol.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-xs text-gray-500">{protocol.networkName}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}