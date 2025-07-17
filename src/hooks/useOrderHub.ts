'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useWriteContract,
  useAccount,
  useChainId,
  usePublicClient,
  useSignTypedData,
  useReadContract
} from 'wagmi';
import { Address, parseUnits, pad, encodeAbiParameters } from 'viem';
import { orderHubAbi } from '@/abi/order-hub-abi';
import { useSwapContext } from '@/contexts/SwapContext';
import { useConfig } from '@/contexts/ConfigContext';
import {
  getErrorMessage,
  prepareOrderRequest,
  tokenToContractFormat,
  TokenType,
  type Token
} from './signature';
import { useApproval } from './useApproval';

// Helper function per ottenere l'indirizzo del contratto hub dalla configurazione
const getHubAddressByNetwork = (
  networkName: string,
  config: any
): string | null => {
  if (!config) return null;
  const network = config.find(
    (net: any) => net.name.toLowerCase() === networkName.toLowerCase()
  );
  return network?.contracts?.hub || null;
};

// Enum per il bridge selector
enum BridgeSelector {
  NONE = 0,
  WORMHOLE = 1,
  CCTP = 2,
  HYPERLANE = 3
}

// Funzione per validare la configurazione dell'ordine
const validateOrderConfiguration = (
  swapData: any,
  config: any,
  chainId: number
): { isValid: boolean; error?: string } => {
  // Verifica che la configurazione sia caricata
  if (!config) {
    return { isValid: false, error: 'Configuration not loaded' };
  }

  // Verifica che ci siano token di input e output
  if (!swapData.input.tokens.length || !swapData.output.tokens.length) {
    return { isValid: false, error: 'Input and output tokens are required' };
  }

  // Verifica che almeno un token di input abbia un amount > 0
  const hasValidInputs = swapData.input.tokens.some((t: any) => t.amount > 0);
  if (!hasValidInputs) {
    return {
      isValid: false,
      error: 'At least one input token must have an amount greater than 0'
    };
  }

  // Verifica che il contratto hub sia disponibile per la rete di input
  const hubAddress = getHubAddressByNetwork(swapData.input.network, config);
  if (!hubAddress) {
    return {
      isValid: false,
      error: `Hub contract not available for network: ${swapData.input.network}`
    };
  }

  // Verifica che la chain corrente corrisponda alla rete di input
  const expectedChainId = getChainIdByNetwork(swapData.input.network);
  if (chainId !== expectedChainId) {
    return {
      isValid: false,
      error: `Please switch to ${swapData.input.network} network (Chain ID: ${expectedChainId})`
    };
  }

  return { isValid: true };
};

// Helper function per ottenere il chain ID da network name
const getChainIdByNetwork = (networkName: string): number => {
  const network = networkName.toLowerCase();
  switch (network) {
    case 'mainnet':
    case 'ethereum':
      return 1;
    case 'polygon':
      return 137;
    case 'optimism':
      return 10;
    case 'arbitrum':
      return 42161;
    case 'base':
      return 8453;
    case 'avalanche':
      return 43114;
    default:
      throw new Error(`Unsupported network: ${networkName}`);
  }
};

export const useOrderHub = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { swapData } = useSwapContext();
  const { config } = useConfig();

  const { writeContract, isPending, isError, error, isSuccess } =
    useWriteContract();

  const { signTypedDataAsync } = useSignTypedData();

  const hubAddress = getHubAddressByNetwork(swapData.input.network, config);

  const { data: contractNonce } = useReadContract({
    address: hubAddress as Address,
    abi: orderHubAbi,
    functionName: 'nonce',
    chainId: getChainIdByNetwork(swapData.input.network),
    query: {
      enabled: !!hubAddress && !!swapData.input.network
    }
  });

  const approval = useApproval({
    tokens:
      swapData.input.tokens.map((t) => {
        const parsedAmount = parseUnits(t.amount.toString(), t.token.decimals);
        return tokenToContractFormat(t.token, parsedAmount);
      }) || [],
    spenderAddress: hubAddress,
    chainId: getChainIdByNetwork(swapData.input.network)
  });

  const createOrder = async () => {
    const sourceChainId = getChainIdByNetwork(swapData.input.network);
    const destinationChainId = getChainIdByNetwork(swapData.output.network);

    if (approval.needsApproval) {
      await approval.execute();
    }

    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    if (chainId !== sourceChainId) {
      throw new Error(
        `Wrong network! Please switch to ${swapData.input.network} (Chain ID: ${sourceChainId}). Currently on Chain ID: ${chainId}`
      );
    }

    if (!hubAddress) {
      throw new Error(
        `Hub contract not found for network: ${swapData.input.network}`
      );
    }

    const inputs: Token[] = swapData.input.tokens
      .filter((t) => t.amount > 0)
      .map((t) => {
        const parsedAmount = parseUnits(t.amount.toString(), t.token.decimals);
        return tokenToContractFormat(t.token, parsedAmount);
      });

    const outputs: Token[] = swapData.output.tokens.map((t, index) => {
      const percentage = swapData.outputPercentages[index] || 0;
      const amount = t.amount * (percentage / 100);
      const parsedAmount = parseUnits(amount.toString(), t.token.decimals);
      return tokenToContractFormat(t.token, parsedAmount);
    });

    // Calculate deadlines like backend
    const deadlineFillerGap = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const deadline = BigInt(currentTimestamp + 3 * deadlineFillerGap);
    const primaryFillerDeadline = BigInt(
      currentTimestamp + 2 * deadlineFillerGap
    );

    // Use contract nonce + 1 like backend
    const nonce = (contractNonce as bigint) + BigInt(1);

    const orderRequest = prepareOrderRequest(
      address,
      inputs,
      outputs,
      sourceChainId,
      destinationChainId,
      deadline,
      nonce,
      primaryFillerDeadline
    );

    try {
      // Add bridging fee to native value like backend (add bridging fee)
      const totalValue = orderRequest.order.inputs
        .filter((input) => input.tokenType === TokenType.NATIVE)
        .reduce((total, input) => total + input.amount, BigInt(0));

      console.log('Creating order with:', {
        hubAddress,
        sourceChainId,
        destinationChainId: getChainIdByNetwork(swapData.output.network),
        currentChainId: chainId,
        inputs: orderRequest.order.inputs.map((i) => ({
          type: i.tokenType,
          address: i.tokenAddress,
          amount: i.amount.toString()
        })),
        // bridgingFee: bridgingFee?.toString(),
        totalValue: totalValue.toString(),
        nonce: orderRequest.nonce.toString()
      });

      // Use EIP-712 typed data signing with exact contract types
      const domain = {
        name: 'iLayer',
        version: '1',
        chainId: sourceChainId,
        verifyingContract: hubAddress as `0x${string}`
      };

      const types = {
        OrderRequest: [
          { name: 'deadline', type: 'uint64' },
          { name: 'nonce', type: 'uint64' },
          { name: 'order', type: 'Order' }
        ],
        Order: [
          { name: 'user', type: 'bytes32' },
          { name: 'recipient', type: 'bytes32' },
          { name: 'filler', type: 'bytes32' },
          { name: 'inputs', type: 'Token[]' },
          { name: 'outputs', type: 'Token[]' },
          { name: 'sourceChainId', type: 'uint32' },
          { name: 'destinationChainId', type: 'uint32' },
          { name: 'sponsored', type: 'bool' },
          { name: 'primaryFillerDeadline', type: 'uint64' },
          { name: 'deadline', type: 'uint64' },
          { name: 'callRecipient', type: 'bytes32' },
          { name: 'callData', type: 'bytes' },
          { name: 'callValue', type: 'uint256' }
        ],
        Token: [
          { name: 'tokenType', type: 'uint8' },
          { name: 'tokenAddress', type: 'bytes32' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount', type: 'uint256' }
        ]
      };

      const message = {
        deadline: orderRequest.deadline,
        nonce: orderRequest.nonce,
        order: orderRequest.order
      };

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'OrderRequest',
        message
      });

      const permits = orderRequest.order.inputs.map((input) => {
        // For native tokens or tokens that don't need permits, return empty bytes
        if (input.tokenType === TokenType.NATIVE) {
          return '0x';
        }

        return '0x';
      });

      const args = [
        orderRequest, // OrderRequest struct
        permits, // permits array (now properly sized)
        signature, // EIP-712 signature
        BridgeSelector.NONE, // bridge selector
        '0x' // extra data
      ];

      const estimatedGas = (await publicClient?.estimateContractGas({
        address: hubAddress as Address,
        abi: orderHubAbi,
        functionName: 'createOrder',
        args,
        value: totalValue
      })) as bigint;

      console.log('Estimated gas:', estimatedGas.toString());

      writeContract({
        chainId: sourceChainId,
        address: hubAddress as Address,
        abi: orderHubAbi,
        functionName: 'createOrder',
        args,
        value: totalValue
      });
    } catch (err) {
      console.error('Error creating order:', err);
      // Usa la funzione di traduzione degli errori
      const userFriendlyMessage = getErrorMessage(err);
      throw new Error(userFriendlyMessage);
    }
  };

  return {
    createOrder,
    isPending: isPending || approval.isPending || approval.isConfirming,
    isError,
    error: error ? new Error(getErrorMessage(error)) : null,
    isSuccess,
    approval,
    isValidOrder: () => {
      const validation = validateOrderConfiguration(swapData, config, chainId);
      return validation.isValid;
    },
    getValidationError: () => {
      const validation = validateOrderConfiguration(swapData, config, chainId);
      return validation.error || null;
    }
  };
};
