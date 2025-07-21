"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface TokenBalanceProps {
    network: string;
    tokenSymbol: string;
    type: 'input' | 'output';
}

export function TokenBalance({ network, tokenSymbol, type }: TokenBalanceProps) {
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

    return (
        <div className="text-xs text-gray-500 text-right">
            <span className="text-gray-400">{balanceLabel}: </span>
            <span className="text-gray-300">{formattedBalance || 0} {symbol}</span>
        </div>
    );
}
