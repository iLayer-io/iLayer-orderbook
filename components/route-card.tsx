import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote } from "@/types/swap"

type RouteProps = {
  route: Quote
  isSelected: boolean
  onSelect?: (quote: Quote) => void
}

export default function RouteCard({ route, onSelect, isSelected }: RouteProps) {
  const handleClick = () => {
    onSelect?.(route);
  };

  return (
    <Card
      className={`p-4 h-32 bg-zinc-900 border-zinc-800 ${!isSelected ? "hover:border-l-4" : ""} cursor-pointer transition-all ${isSelected ? "border-l-4 border-l-orange-500" : ""
        }`}
      onClick={handleClick}
    >
      {
        route.outputTokens.map((token) => (
          <div key={token.symbol} className="flex justify-between items-start">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">{token.amount}</span>
              <span className="text-gray-400">{token.symbol}</span>
            </div>

            {route.isError && <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Error</Badge>}
          </div>
        ))
      }

      {route.isError && route.errorMessage && (
        <div className="text-sm text-red-500 mt-1">{route.errorMessage}</div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          {route.source && (
            <span className="text-sm text-gray-300">{route.source}</span>
          )}
        </div>
      </div>
    </Card>
  )
}
