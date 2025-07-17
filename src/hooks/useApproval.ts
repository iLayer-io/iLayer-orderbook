import { useCallback, useState } from 'react';
import { Address, erc20Abi } from 'viem';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  usePublicClient
} from 'wagmi';
import { TokenType, type Token } from './signature';
import { useQuery } from '@tanstack/react-query';

interface UseApprovalProps {
  tokens: Token[];
  spenderAddress: string | null;
  chainId: number;
}

export const useApproval = ({
  tokens,
  spenderAddress,
  chainId
}: UseApprovalProps) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const {
    data: hash,
    writeContractAsync,
    isPending: isWritePending,
    reset
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError
  } = useWaitForTransactionReceipt({
    hash,
    chainId,
    query: {
      enabled: !!hash && chainId !== undefined
    }
  });

  const erc20Tokens = tokens.filter(
    (token) => token.tokenType === TokenType.ERC20
  );

  const { data: tokenAllowances, isLoading: isLoadingAllowances } = useQuery({
    queryKey: [
      'getTokenAllowances',
      erc20Tokens.map((token) => token.tokenAddress),
      address,
      spenderAddress
    ],
    queryFn: async () => {
      const tokenAllowances = [];
      for (const token of erc20Tokens) {
        const tokenAddress = `0x${token.tokenAddress.slice(-40)}` as Address;
        const allowance = await publicClient?.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address as Address, spenderAddress as Address]
        });

        tokenAllowances.push({ token, allowance: allowance || BigInt(0) });
      }
      return tokenAllowances;
    },
    enabled: !!address && !!spenderAddress && erc20Tokens.length > 0
  });

  const needsApproval = tokenAllowances?.some(
    ({ token, allowance }) => allowance < token.amount
  );

  const execute = useCallback(async () => {
    if (!address || !spenderAddress) {
      throw new Error('Wallet not connected or spender address not provided');
    }

    if (!needsApproval) {
      return;
    }

    try {
      // Find the first token that needs approval
      for (const { token, allowance } of tokenAllowances || []) {
        if (allowance < token.amount) {
          const tokenAddress = `0x${token.tokenAddress.slice(-40)}` as Address;

          console.log(
            `Approving token ${tokenAddress} for amount ${token.amount.toString()}`
          );

          const hash = await writeContractAsync({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            chainId,
            args: [spenderAddress as Address, token.amount]
          });

          await publicClient?.waitForTransactionReceipt({
            hash
          });

          break;
        }
      }
    } catch (error) {
      console.error('Token approval failed:', error);
      throw new Error('Token approval failed');
    }
  }, [
    address,
    spenderAddress,
    chainId,
    erc20Tokens,
    needsApproval,
    writeContractAsync
  ]);

  return {
    isPending: isWritePending || isLoadingAllowances,
    isConfirming,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    needsApproval,
    isSkipped: erc20Tokens.length === 0, // Skip if no ERC20 tokens
    execute,
    reset
  };
};
