"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/contexts/ConfigContext";

interface TokenUsdProps {
    tokenSymbol: string;
    amount: string;
    networkName: string;
}

export function TokenUsd({ tokenSymbol, amount, networkName }: TokenUsdProps) {
    const [usdPrice, setUsdPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const { getCoingeckoId } = useConfig();

    useEffect(() => {
        if (!tokenSymbol || !amount || parseFloat(amount) === 0) {
            setUsdPrice(null);
            return;
        }

        const fetchUsdPrice = async () => {
            setIsLoading(true);
            setIsError(false);

            try {
                const coingeckoId = getCoingeckoId(networkName, tokenSymbol);

                if (!coingeckoId) {
                    setIsError(true);
                    return;
                }

                const response = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch price');
                }

                const data = await response.json();
                const price = data[coingeckoId]?.usd;

                if (price) {
                    setUsdPrice(price);
                } else {
                    setIsError(true);
                }
            } catch (error) {
                console.error('Error fetching USD price:', error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsdPrice();
    }, [tokenSymbol, amount, networkName, getCoingeckoId]);

    const calculateUsdValue = () => {
        if (!usdPrice || !amount) return null;
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return null;
        return (numericAmount * usdPrice).toFixed(2);
    };

    if (!amount || parseFloat(amount) === 0) {
        return null;
    }

    if (isLoading) {
        return <Skeleton className="w-16 h-3" />;
    }

    if (isError || !usdPrice) {
        return (
            <div className="text-xs text-gray-500 text-right">
                <span className="text-gray-400">~$--</span>
            </div>
        );
    }

    const usdValue = calculateUsdValue();

    return (
        <div className="text-xs text-gray-500 text-right">
            <span className="text-gray-400">~${usdValue}</span>
        </div>
    );
}
