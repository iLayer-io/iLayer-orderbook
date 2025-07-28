"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSwap } from "@/contexts/SwapContext";

interface TokenBalanceProps {
    network: string;
    tokenSymbol: string;
    type: 'input' | 'output';
}

export function TokenBalance({ network, tokenSymbol, type, }: TokenBalanceProps) {
    const { updateInputAmount } = useSwap();

    const { formattedBalance, balanceLabel, symbol, isLoading, isError } = useTokenBalance({
        network,
        tokenSymbol,
        type
    });

    if (isLoading) {
        return <Skeleton className="w-16 h-3" />;
    }

    if (isError) {
        return (
            <div className="text-red-400 text-xs text-right">Error</div>
        );
    }

    const handleMaxClick = () => {
        if (formattedBalance && symbol) {
            updateInputAmount(symbol, formattedBalance);
        }
    };

    return (
        <div className="text-xs text-gray-500 text-left flex items-center gap-1">
            <span className="text-gray-400">{balanceLabel}: </span>
            <span className="text-gray-300">{formattedBalance || 0} {symbol}</span>
            {type === 'input' && formattedBalance && symbol && (
                <Button
                    variant="link"
                    size="sm"
                    className="h-4 px-1 text-xs text-blue-400 hover:text-blue-300"
                    onClick={handleMaxClick}
                >
                    Max
                </Button>
            )}
        </div>
    );
}
