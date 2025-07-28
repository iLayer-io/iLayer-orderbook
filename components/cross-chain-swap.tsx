"use client"

import { ArrowDown, Settings, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import ResponsiveTokenSelector from "@/components/responsive-token-selector"
import TokenRow from "@/components/token-row"
import SwapButton from "@/components/swap-button"
import { useSwap } from "@/contexts/SwapContext"
import QuotesPanel from "./quotes-panel"
import { useConfig } from "@/contexts/ConfigContext"
import { useWaku } from "@waku/react"
import { useSwitchChain } from "wagmi"
import ResponsiveSettingsModal from "@/components/responsive-settings-modal"

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
    addInputToken,
    addOutputToken,
    removeInputToken,
    removeOutputToken,
    updateInputTokenAmount,
    updateOutputTokenAmount,
    updateOutputPercentages,
    invertSwap,
    settings,
    openSettings,
    closeSettings,
  } = useSwap()

  const { getChainId } = useConfig()

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
      <div className="flex flex-col items-center mb-12 mt-8 md:mt-16">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
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
                      showUsd
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
                      percentage={swapData.outputPercentages[index]}
                      onUpdatePercentage={(idx, percentage) => updateOutputPercentages(idx, percentage)}
                      showUsd
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
      />

      <ResponsiveSettingsModal
        isOpen={settings.isOpen}
        onClose={closeSettings}
      />
    </div>
  )
}