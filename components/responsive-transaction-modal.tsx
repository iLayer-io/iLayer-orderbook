"use client"

import { useMediaQuery } from "@/hooks/use-mobile"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import TransactionModalContent from "./transaction-modal-content"
import { useSwap } from "@/contexts/SwapContext"

interface ResponsiveTransactionModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ResponsiveTransactionModal({
    isOpen,
    onClose,
}: ResponsiveTransactionModalProps) {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const { selectedQuote } = useSwap()

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={onClose}>
                <DrawerContent className="bg-zinc-900 border-zinc-800 text-white">
                    <TransactionModalContent
                        onClose={onClose}
                        isMobile={true}
                        selectedQuote={selectedQuote}
                    />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md p-0 gap-0">
                <TransactionModalContent
                    onClose={onClose}
                    isMobile={false}
                    selectedQuote={selectedQuote}
                />
            </DialogContent>
        </Dialog>
    )
}
