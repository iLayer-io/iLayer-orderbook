"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useOrderHub } from "@/hooks/useOrderHub"
import { useSwap } from "@/contexts/SwapContext"
import ResponsiveTransactionModal from "./responsive-transaction-modal"


export default function SwapButton() {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
    const { isValidOrder, getValidationError } = useOrderHub()
    const { selectedQuote } = useSwap()

    const validationError = getValidationError()
    const isValid = isValidOrder()

    const getButtonText = () => {
        if (validationError) {
            return validationError
        }
        if (!selectedQuote) {
            return 'No quote selected'
        }
        return 'SWAP'
    }

    const isButtonEnabled = isValid && !validationError && selectedQuote !== null

    const handleSwapClick = () => {
        if (isButtonEnabled) {
            setIsTransactionModalOpen(true)
        }
    }

    return (
        <>
            <Button
                className={`w-full py-6 ${isButtonEnabled
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-600 cursor-not-allowed text-gray-400'
                    }`}
                disabled={!isButtonEnabled}
                onClick={handleSwapClick}
            >
                {getButtonText()}
            </Button>

            <ResponsiveTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                selectedQuote={selectedQuote}
            />
        </>
    )
}
