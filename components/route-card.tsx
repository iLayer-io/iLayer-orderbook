import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { baseUrl, safeParseFloat } from "@/lib/utils"
import { Quote } from "@/types/swap"

type RouteProps = {
  route: Quote
  isSelected: boolean
  onSelect?: (quote: Quote) => void
}

export default function RouteCard({ route, onSelect, isSelected }: RouteProps) {
  // Calculate primary output token for display
  const primaryOutput = route.outputTokens[0] || { amount: "0", symbol: "N/A" };
  const outputAmount = primaryOutput.amount;

  const handleClick = () => {
    onSelect?.(route);
  };

  return (
    <Card
      className={`p-4 h-32 bg-zinc-900 border-zinc-800 ${!isSelected ? "hover:border-l-4" : ""} cursor-pointer transition-all ${isSelected ? "border-l-4 border-l-orange-500" : ""
        }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold">{outputAmount}</span>
          <span className="text-gray-400">{primaryOutput.symbol}</span>
        </div>

        {route.isBest && <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50">BEST</Badge>}

        {route.isError && <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Error</Badge>}
      </div>

      {route.estimatedAfterGas && (
        <div className="text-sm text-gray-400 mt-1">
          Estimated amount after gas: ${route.estimatedAfterGas}
        </div>
      )}

      {route.isError && route.errorMessage && (
        <div className="text-sm text-red-500 mt-1">{route.errorMessage}</div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          {route.source && (
            <>
              {route.sourceLogo && (
                <img src={`${baseUrl}/${route.sourceLogo}`} alt={route.source} className="h-4 w-4" />
              )}
              <span className="text-sm text-gray-300">{route.source}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {route.percentage && safeParseFloat(route.percentage) !== 0 && (
            <span className={`text-sm ${route.isPositive ? "text-green-500" : "text-red-500"}`}>
              {route.isPositive ? "+" : ""}{route.percentage}%
            </span>
          )}

          {route.timeEstimate && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="h-3 w-3" />
              <span>{route.timeEstimate}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
