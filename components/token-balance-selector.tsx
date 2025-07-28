"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface TokenBalanceSelectorProps {
    network: string;
    tokenSymbol: string;
}

export function TokenBalanceSelector({ network, tokenSymbol, }: TokenBalanceSelectorProps) {

    const { formattedBalance, isLoading, isError } = useTokenBalance({
        network,
        tokenSymbol,
        type: 'input'
    });

    if (isLoading) {
        return <Skeleton className="w-16 h-3" />;
    }

    if (isError) {
        return (
            <span></span>
        );
    }

    return <span>{formattedBalance || 0}</span>
}
