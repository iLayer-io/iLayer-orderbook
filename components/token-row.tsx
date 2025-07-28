"use client"

import { Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenBalance } from "@/components/token-balance"
import { TokenUsd } from "@/components/token-usd"
import { useConfig } from "@/contexts/ConfigContext"
import { baseUrl, safeParseFloat } from "@/lib/utils"

interface TokenRowProps {
    tokenWithAmount: { symbol: string; amount: string }
    index: number
    network: string
    type: 'input' | 'output'
    advancedMode: boolean
    wakuLoading: boolean
    showRemoveButton: boolean
    showBalance?: boolean
    showUsd?: boolean
    percentage?: string
    onTokenSelect: (index: number) => void
    onRemoveToken: (index: string) => void
    onUpdateAmount: (index: string, amount: string) => void
    onUpdatePercentage?: (index: number, percentage: string) => void
}

export default function TokenRow({
    tokenWithAmount,
    index,
    network,
    type,
    advancedMode,
    showBalance,
    showUsd,
    wakuLoading,
    showRemoveButton,
    percentage,
    onTokenSelect,
    onRemoveToken,
    onUpdateAmount,
    onUpdatePercentage
}: TokenRowProps) {
    const { getTokenBySymbol } = useConfig()
    const token = getTokenBySymbol(network, tokenWithAmount.symbol)


    const handleUpdatePercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty input for better UX while typing
        if (value === '') {
            onUpdatePercentage?.(index, '0');
            return;
        }

        // Parse and validate the input
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
            onUpdatePercentage?.(index, value);
        }
    }

    return (
        <div className="flex items-center gap-4">
            {showRemoveButton && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex-shrink-0"
                    onClick={() => onRemoveToken(index.toString())}
                >
                    <Minus className="h-3 w-3" />
                </Button>
            )}

            <button
                onClick={() => onTokenSelect(index)}
                className="flex h-14 items-center gap-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-3 py-2 rounded-md min-w-0 flex-shrink-0"
            >
                {token ? (
                    <>
                        <img
                            src={`${baseUrl}/tokens/${token.icon}`}
                            alt={token.symbol}
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="text-left min-w-0">
                            <div className="font-medium text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-400 truncate">{token.name}</div>
                        </div>
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">Select token</span>
                )}
            </button>

            {/* Percentage input for output tokens in advanced mode */}
            {advancedMode && type === 'output' && onUpdatePercentage && (
                <div className="flex flex-col items-center">
                    <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        max={100}
                        step="1"
                        value={percentage}
                        onChange={handleUpdatePercentage}
                        className="bg-transparent text-center text-lg font-medium border border-zinc-700 rounded w-16 h-8"
                    />
                    <div className="text-xs text-gray-400 mt-1">%</div>
                </div>
            )}

            <div className="flex flex-col h-14 flex-1 justify-between min-w-0">
                {wakuLoading && type === 'input' ? (
                    <Skeleton className="h-14 w-full bg-zinc-800" />
                ) : (
                    <>
                        <Input
                            type="number"
                            placeholder={type === 'input' ? "0.00" : undefined}
                            min={type === 'input' ? 0 : undefined}
                            step={type === 'input' ? "0.01" : undefined}
                            value={tokenWithAmount.amount}
                            onChange={(e) => onUpdateAmount(index.toString(), e.target.value)}
                            className="bg-transparent text-right text-lg font-medium border-none focus-visible:outline-none w-full"
                            readOnly={type === 'output'}
                        />
                        <div className="flex justify-between items-end">
                            {showBalance && (
                                <TokenBalance
                                    network={network}
                                    tokenSymbol={tokenWithAmount.symbol}
                                    type={type}
                                />
                            )}
                            <div className="ml-auto">
                                {showUsd && (
                                    <TokenUsd
                                        tokenSymbol={tokenWithAmount.symbol}
                                        amount={tokenWithAmount.amount}
                                        networkName={network}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
