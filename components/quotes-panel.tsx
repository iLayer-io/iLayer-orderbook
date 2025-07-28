import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import RouteCard from "./route-card";
import { AUTO_REFRESH_INTERVAL, MAX_QUOTES, useWakuQuotes } from "@/hooks/useWakuQuotes";
import { Progress } from "./ui/progress";
import { useOrderHub } from "@/hooks/useOrderHub";

export default function QuotesPanel() {
    const { isValidOrder } = useOrderHub()
    const { quotes, isFetching, hasZeroAmountInput, wakuInitialized, selectedQuote, countdown, handleSelectQuote, refreshQuotes } = useWakuQuotes(isValidOrder);

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    Select a Route {isFetching && !hasZeroAmountInput && <span className="text-orange-500 text-sm ml-2">Updating...</span>}
                </h3>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshQuotes}
                    disabled={isFetching || !wakuInitialized || hasZeroAmountInput}
                    className="h-8 w-8"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
            </div>

            <div>
                {hasZeroAmountInput && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Enter token amounts to see quotes</p>
                    </div>
                )}
                {!hasZeroAmountInput && (
                    <div className="space-y-3">
                        <Progress value={Math.floor((countdown / (AUTO_REFRESH_INTERVAL / 1000)) * 100)} className="h-2" />
                        {isFetching || !wakuInitialized ? (
                            // Loading skeletons
                            Array.from({ length: MAX_QUOTES }).map((_, idx) => (
                                <Skeleton key={idx} className="h-32 w-full bg-zinc-800" />
                            ))
                        ) : !isValidOrder(false) || (quotes.length === 0 && !hasZeroAmountInput) ? (
                            // No quotes available
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">No routes available. Try adjusting your token selection or amounts.</p>
                            </div>
                        ) : (
                            // Actual quotes
                            quotes.map((quote, index) => (
                                <RouteCard
                                    key={quote.id + index}
                                    route={quote}
                                    isSelected={selectedQuote?.id === quote.id}
                                    onSelect={handleSelectQuote}
                                />
                            ))
                        )}
                    </div>
                )}


            </div>
        </div>

    );
}
