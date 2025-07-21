"use client"

import { ArrowDown, Info, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ResponsiveTokenSelector from "@/components/responsive-token-selector"
import TokenRow from "@/components/token-row"
import SwapButton from "@/components/swap-button"
import { useSwap } from "@/contexts/SwapContext"
import type { TokenOrDefiToken } from "@/types/swap"
import QuotesPanel from "./quotes-panel"
import { useConfig } from "@/contexts/ConfigContext"
import { useWaku } from "@waku/react"
import { useSwitchChain } from "wagmi"

export default function CrossChainSwap() {
  const { isLoading: wakuLoading } = useWaku()
  const { switchChain } = useSwitchChain()
  const {
    swapData,
    advancedMode,
    toggleAdvancedMode,
    tokenSelector,
    openTokenSelector,
    closeTokenSelector,
    selectToken,
    addInputToken,
    addOutputToken,
    removeInputToken,
    removeOutputToken,
    updateInputTokenAmount,
    updateOutputTokenAmount,
    invertSwap,
  } = useSwap()

  const { getChainId } = useConfig()

  const handleTokenSelect = (token: TokenOrDefiToken) => {
    if (tokenSelector.type === "input") {
      const newInputNetwork = swapData.output.network
      const chainId = getChainId(newInputNetwork)
      if (chainId && switchChain) {
        try {
          switchChain({ chainId })
          console.log(`Switched to ${newInputNetwork} (Chain ID: ${chainId}) after invert`)
          selectToken(token)
        } catch (error) {
          console.error('Failed to switch chain after invert:', error)
        }
      }
    }
  }

  const handleInvertSwap = async () => {
    const newInputNetwork = swapData.output.network
    const chainId = getChainId(newInputNetwork)

    if (chainId && switchChain) {
      try {
        switchChain({ chainId })
        console.log(`Switched to ${newInputNetwork} (Chain ID: ${chainId}) after invert`)
        invertSwap()
      } catch (error) {
        console.error('Failed to switch chain after invert:', error)
      }
    }
  }

  return (
    <div className="w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold">
            <span className="text-white">BEYOND</span> <span className="text-orange-500">BRIDGES</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm">Intent + Execution across modular chains</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Swap Configuration */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Swap</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Adv. Mode</span>
              <Switch
                checked={advancedMode}
                onCheckedChange={toggleAdvancedMode}
                className="data-[state=checked]:bg-green-500"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Advanced mode enables multi-token swaps</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 p-4 mb-4">
            <div className="space-y-4">
              {/* Sell Tokens Section */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                  <span>You sell on {swapData.input.network}</span>
                </div>

                <div className="space-y-2">
                  {swapData.input.tokens.map((tokenWithAmount, index) => (
                    <TokenRow
                      key={index}
                      tokenWithAmount={tokenWithAmount}
                      index={index}
                      network={swapData.input.network}
                      type="input"
                      advancedMode={advancedMode}
                      wakuLoading={wakuLoading}
                      showRemoveButton={advancedMode && index !== 0}
                      onTokenSelect={(idx) => openTokenSelector("input", idx.toString())}
                      onRemoveToken={removeInputToken}
                      onUpdateAmount={updateInputTokenAmount}
                      showBalance
                    />
                  ))}

                  {advancedMode && swapData.input.tokens.length < 3 && (
                    <Button
                      variant="ghost"
                      onClick={addInputToken}
                      className="w-full border-2 border-dashed border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add token
                    </Button>
                  )}
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
                  onClick={handleInvertSwap}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>              {/* Buy Tokens Section */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                  <span>You buy on {swapData.output.network}</span>
                </div>

                <div className="space-y-2">
                  {swapData.output.tokens.map((tokenWithAmount, index) => (
                    <TokenRow
                      key={index}
                      tokenWithAmount={tokenWithAmount}
                      index={index}
                      network={swapData.output.network}
                      type="output"
                      advancedMode={advancedMode}
                      wakuLoading={wakuLoading}
                      showRemoveButton={advancedMode && index !== 0}
                      onTokenSelect={(idx) => openTokenSelector("output", idx.toString())}
                      onRemoveToken={removeOutputToken}
                      onUpdateAmount={updateOutputTokenAmount}
                      showBalance={swapData.output.network === swapData.input.network} // Show balance only if same network and single output token
                    />
                  ))}

                  {advancedMode && swapData.output.tokens.length < 3 && (
                    <Button
                      variant="ghost"
                      onClick={addOutputToken}
                      className="w-full border-2 border-dashed border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add token
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Swap Button */}
          <SwapButton />
        </div>

        {/* Right Panel: Route Selection */}
        <QuotesPanel />
      </div>

      <ResponsiveTokenSelector
        isOpen={tokenSelector.isOpen}
        onClose={closeTokenSelector}
        title={tokenSelector.type === "input" ? "Exchange From" : "Exchange To"}
        selectedToken={null}
        onSelectToken={handleTokenSelect}
      />
    </div>
  )
}