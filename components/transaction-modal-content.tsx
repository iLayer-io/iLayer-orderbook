"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { useOrderHub } from "@/hooks/useOrderHub"
import { useSwap } from "@/contexts/SwapContext"
import { useConfig } from "@/contexts/ConfigContext"
import { Quote } from "@/types/swap"
import { baseUrl, safeParseFloat } from "@/lib/utils"

type TransactionStep = 'details' | 'pending' | 'outcome'

interface TransactionModalContentProps {
    onClose: () => void
    isMobile: boolean
    selectedQuote: Quote | null
}

export default function TransactionModalContent({
    onClose,
    isMobile,
    selectedQuote,
}: TransactionModalContentProps) {
    const [currentStep, setCurrentStep] = useState<TransactionStep>('details')
    const { swapData } = useSwap()
    const { getTokenBySymbol } = useConfig()
    const { createOrder, isPending, isError, error, isSuccess } = useOrderHub()
    // Gestisci il cambio di stato automatico
    useEffect(() => {
        if (isPending && currentStep === 'details') {
            setCurrentStep('pending')
        }
    }, [isPending, currentStep])

    useEffect(() => {
        if ((isSuccess || isError) && currentStep === 'pending') {
            setCurrentStep('outcome')
        }
    }, [isSuccess, isError, currentStep])

    const handleSwap = async () => {
        try {
            await createOrder()
        } catch (err) {
            console.error('Swap failed:', err)
            setCurrentStep('outcome')
        }
    }

    const handleClose = () => {
        setCurrentStep('details')
        onClose()
    }

    const renderHeader = () => {
        const titles = {
            details: 'Swap Details',
            pending: 'Processing Transaction',
            outcome: isSuccess ? 'Transaction Successful' : 'Transaction Failed'
        }

        if (isMobile) {
            return (
                <DrawerHeader className="text-left border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        {currentStep === 'details' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-zinc-800"
                                onClick={handleClose}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DrawerTitle>{titles[currentStep]}</DrawerTitle>
                    </div>
                </DrawerHeader>
            )
        }

        return (
            <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                {currentStep === 'details' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-zinc-800"
                        onClick={handleClose}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <DialogTitle className="text-lg font-semibold">{titles[currentStep]}</DialogTitle>
            </div>
        )
    }

    const renderDetailsStep = () => (
        <div className="p-4 space-y-4">
            {/* Input Tokens */}
            <Card className="bg-zinc-800 border-zinc-700 p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-400">You're selling</h3>
                    <span className="text-xs text-gray-500">{swapData.input.network}</span>
                </div>
                <div className="space-y-2">
                    {swapData.input.tokens
                        .filter(token => safeParseFloat(token.amount) > 0)
                        .map((token, index) => {
                            const tokenData = getTokenBySymbol(swapData.input.network, token.symbol)
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img src={`${baseUrl}/tokens/${tokenData?.icon}`} alt={token.symbol} className="h-6 w-6 rounded-full" />
                                        <span className="font-medium">{token.symbol}</span>
                                    </div>
                                    <span className="font-medium">{token.amount}</span>
                                </div>
                            )
                        })}
                </div>
            </Card>

            {/* Arrow */}
            <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>

            {/* Output Tokens */}
            <Card className="bg-zinc-800 border-zinc-700 p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-400">You're buying</h3>
                    <span className="text-xs text-gray-500">{swapData.output.network}</span>
                </div>
                <div className="space-y-2">
                    {swapData.output.tokens.map((token, index) => {
                        const tokenData = getTokenBySymbol(swapData.output.network, token.symbol)
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={`${baseUrl}/tokens/${tokenData?.icon}`} alt={token.symbol} className="h-6 w-6 rounded-full" />
                                    <span className="font-medium">{token.symbol}</span>
                                </div>
                                <span className="font-medium">{token.amount || '~'}</span>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Selected Quote Details */}
            {selectedQuote && (
                <Card className="bg-zinc-800 border-zinc-700 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-400">Selected Route</h3>
                        <span className="text-xs text-green-500">Best Route</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Provider</span>
                            <span className="font-medium">{selectedQuote.source}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Estimated Time</span>
                            <span className="font-medium">{selectedQuote.timeEstimate}</span>
                        </div>
                        {selectedQuote.percentage && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Price Impact</span>
                                <span className={`font-medium ${selectedQuote.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {selectedQuote.isPositive ? '+' : ''}{selectedQuote.percentage}%
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Output Value</span>
                            <span className="font-medium">${selectedQuote.outputValueUSD}</span>
                        </div>
                        {selectedQuote.estimatedAfterGas && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">After Gas</span>
                                <span className="font-medium">${selectedQuote.estimatedAfterGas}</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}            {/* Swap Button */}
            <Button
                onClick={handleSwap}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                disabled={isPending}
            >
                {isPending ? 'Processing...' : 'Confirm Swap'}
            </Button>
        </div>
    )

    const renderPendingStep = () => (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <h3 className="text-lg font-semibold">Processing your swap...</h3>
            <p className="text-sm text-gray-400 text-center">
                Please wait while we process your transaction. This may take a few moments.
            </p>
        </div>
    )

    const renderOutcomeStep = () => (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
            {isSuccess ? (
                <>
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-500">Transaction Successful!</h3>
                    <p className="text-sm text-gray-400 text-center">
                        Your swap has been processed successfully.
                    </p>
                </>
            ) : (
                <>
                    <XCircle className="h-12 w-12 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-500">Transaction Failed</h3>
                    <p className="text-sm text-gray-400 text-center">
                        {error?.message || 'An unexpected error occurred during the swap.'}
                    </p>
                </>
            )}

            <Button
                onClick={handleClose}
                className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium"
            >
                Close
            </Button>
        </div>
    )

    return (
        <div className="flex flex-col h-full">
            {renderHeader()}

            <div className="flex-1">
                {currentStep === 'details' && renderDetailsStep()}
                {currentStep === 'pending' && renderPendingStep()}
                {currentStep === 'outcome' && renderOutcomeStep()}
            </div>
        </div>
    )
}
