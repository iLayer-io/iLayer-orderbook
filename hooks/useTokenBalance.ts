import { useMemo } from 'react';
import { erc20Abi, Address } from 'viem';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { useConfig } from '@/contexts/ConfigContext';
import { formatNumber } from '@/lib/utils';

interface UseTokenBalanceProps {
  network: string;
  tokenSymbol: string;
  type: 'input' | 'output';
}

export function useTokenBalance({
  network,
  tokenSymbol,
  type
}: UseTokenBalanceProps) {
  const { address: walletAddress } = useAccount();
  const { getTokenBySymbol, getChainId } = useConfig();

  const token = getTokenBySymbol(network, tokenSymbol);
  const chainId = getChainId(network);

  // Se il token non esiste o non c'è wallet, restituisci valori vuoti
  const isEnabled = !!walletAddress && !!token && !!chainId;

  // Per token ERC20 (hanno address)
  const isERC20 =
    token?.address &&
    token.address !== '0x0000000000000000000000000000000000000000';

  // Hook per leggere il balance di token ERC20
  const {
    data: erc20Balance,
    isLoading: isLoadingERC20,
    isError: isErrorERC20
  } = useReadContract({
    address: token?.address as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress as Address],
    chainId,
    query: {
      enabled: isEnabled && isERC20
    }
  });

  // Hook per leggere il balance nativo (ETH, ecc.)
  const {
    data: nativeBalance,
    isLoading: isLoadingNative,
    isError: isErrorNative
  } = useBalance({
    address: walletAddress,
    chainId,
    query: {
      enabled: isEnabled && !isERC20
    }
  });

  // Determina quale balance utilizzare
  const rawBalance = isERC20 ? erc20Balance : nativeBalance?.value;
  const decimals = isERC20 ? token?.decimals : nativeBalance?.decimals;

  const formattedBalance = useMemo(() => {
    if (!token?.symbol || !chainId || !rawBalance || !decimals) {
      return null;
    }

    const numericBalance = formatNumber(rawBalance, decimals);
    return numericBalance.toFixed(4); // Mostra 4 decimali
  }, [rawBalance, decimals, token?.symbol, chainId]);

  const balanceLabel = type === 'input' ? 'Balance' : 'Available';

  return {
    balance: rawBalance,
    formattedBalance,
    balanceLabel,
    symbol: token?.symbol,
    isLoading: isLoadingERC20 || isLoadingNative,
    isError: isErrorERC20 || isErrorNative
  };
}
