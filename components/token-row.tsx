"use client"

import { Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenBalance } from "@/components/token-balance"
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
    onTokenSelect: (index: number) => void
    onRemoveToken: (index: string) => void
    onUpdateAmount: (index: string, amount: string) => void
}

export default function TokenRow({
    tokenWithAmount,
    index,
    network,
    type,
    showBalance,
    wakuLoading,
    showRemoveButton,
    onTokenSelect,
    onRemoveToken,
    onUpdateAmount
}: TokenRowProps) {
    const { getTokenBySymbol } = useConfig()
    const token = getTokenBySymbol(network, tokenWithAmount.symbol)

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
                        {showBalance && (
                            <TokenBalance
                                network={network}
                                tokenSymbol={tokenWithAmount.symbol}
                                type={type}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
