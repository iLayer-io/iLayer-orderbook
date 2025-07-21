"use client"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import TokenSelectorContent from "@/components/token-selector-content"
import { TokenOrDefiToken } from "@/types/swap"

type Token = {
  symbol: string
  name: string
  icon: string
  balance: number
  chainId: number
  chainName: string
  chainColor: string
}

interface ResponsiveTokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  title: string
  selectedToken: TokenOrDefiToken | null
  onSelectToken: (token: TokenOrDefiToken) => void
}

export default function ResponsiveTokenSelector({
  isOpen,
  onClose,
  title,
  selectedToken,
  onSelectToken,
}: ResponsiveTokenSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="bg-zinc-900 border-zinc-800 text-white">
          <TokenSelectorContent
            title={title}
            selectedToken={selectedToken}
            onSelectToken={onSelectToken}
            onClose={onClose}
            isMobile={true}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md p-0 gap-0">
        <TokenSelectorContent
          title={title}
          selectedToken={selectedToken}
          onSelectToken={onSelectToken}
          onClose={onClose}
          isMobile={false}
        />
      </DialogContent>
    </Dialog>
  )
}
