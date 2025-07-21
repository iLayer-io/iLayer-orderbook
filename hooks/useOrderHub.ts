'use client';

import {
  useWriteContract,
  useAccount,
  useChainId,
  usePublicClient,
  useSignTypedData,
  useReadContract
} from 'wagmi';
import { Address, parseUnits } from 'viem';
import { orderHubAbi } from '@/lib/order-hub-abi';
import { useConfig } from '@/contexts/ConfigContext';
import {
  BridgeSelector,
  getErrorMessage,
  prepareOrderRequest,
  tokenToContractFormat,
  TokenType,
  type Token
} from '@/lib/order';
import { useApproval } from './useApproval';
import { useSwap } from '@/contexts/SwapContext';
import { safeParseFloat } from '@/lib/utils';

export const useOrderHub = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { getHubAddressByNetwork, getChainId, getTokenBySymbol } = useConfig();
  const { swapData } = useSwap();

  const validateOrderConfiguration = (): {
    isValid: boolean;
    error?: string;
  } => {
    if (!swapData.input.tokens.length || !swapData.output.tokens.length) {
      return { isValid: false, error: 'Input and output tokens are required' };
    }

    // Check if we have valid input amounts (equivalent to canSwap logic)
    const hasValidInputs = swapData.input.tokens.some((t) => {
      const token = getTokenBySymbol(swapData.input.network, t.symbol);
      return token && safeParseFloat(t.amount) > 0;
    });

    if (!hasValidInputs) {
      return {
        isValid: false,
        error: 'Enter amounts to swap'
      };
    }

    // Check if we have valid output tokens
    const hasValidOutputs = swapData.output.tokens.some((t) => {
      const token = getTokenBySymbol(swapData.output.network, t.symbol);
      return token;
    });

    if (!hasValidOutputs) {
      return {
        isValid: false,
        error: 'Select output tokens'
      };
    }

    const hubAddress = getHubAddressByNetwork(swapData.input.network);
    if (!hubAddress) {
      return {
        isValid: false,
        error: `Hub contract not available for network: ${swapData.input.network}`
      };
    }

    const expectedChainId = getChainId(swapData.input.network);
    if (chainId !== expectedChainId) {
      return {
        isValid: false,
        error: `Please switch to ${swapData.input.network} network`
      };
    }

    return { isValid: true };
  };

  const { writeContract, isPending, isError, error, isSuccess } =
    useWriteContract();

  const { signTypedDataAsync } = useSignTypedData();

  const hubAddress = getHubAddressByNetwork(swapData.input.network);

  // get contract nonce
  const { data: contractNonce } = useReadContract({
    address: hubAddress as Address,
    abi: orderHubAbi,
    functionName: 'nonce',
    chainId: getChainId(swapData.input.network),
    query: {
      enabled: !!hubAddress && !!swapData.input.network
    }
  });

  const approval = useApproval({
    tokens:
      swapData.input.tokens.map((t) => {
        const token = getTokenBySymbol(swapData.input.network, t.symbol);
        const parsedAmount = parseUnits(t.amount.toString(), token!.decimals);
        return tokenToContractFormat(token!, parsedAmount);
      }) || [],
    spenderAddress: hubAddress,
    chainId: getChainId(swapData.input.network)!
  });

  const createOrder = async () => {
    const sourceChainId = getChainId(swapData.input.network)!;
    const destinationChainId = getChainId(swapData.output.network)!;

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
      .filter((t) => safeParseFloat(t.amount) > 0)
      .map((t) => {
        const token = getTokenBySymbol(swapData.input.network, t.symbol);
        const parsedAmount = parseUnits(t.amount.toString(), token!.decimals);
        return tokenToContractFormat(token!, parsedAmount);
      });

    const outputs: Token[] = swapData.output.tokens.map((t, index) => {
      const percentage = swapData.outputPercentages[index] || 0;
      const amount = safeParseFloat(t.amount) * (percentage / 100);
      const token = getTokenBySymbol(swapData.output.network, t.symbol);
      const parsedAmount = parseUnits(amount.toString(), token!.decimals);
      return tokenToContractFormat(token!, parsedAmount);
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
        destinationChainId: getChainId(swapData.output.network),
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
      const validation = validateOrderConfiguration();
      return validation.isValid;
    },
    getValidationError: () => {
      const validation = validateOrderConfiguration();
      return validation.error || null;
    }
  };
};
