'use client';

import {
  useWriteContract,
  useAccount,
  useChainId,
  useSignTypedData,
  useReadContract,
  useBlock,
  useClient,
  useWalletClient,
  usePublicClient
} from 'wagmi';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { routerAbi } from '@/lib/router-abi';
import {
  Address,
  parseUnits,
  encodeAbiParameters,
  parseAbiParameters
} from 'viem';
import { orderHubAbi } from '@/lib/order-hub-abi';
import { useConfig } from '@/contexts/ConfigContext';
import {
  getDomain,
  getErrorMessage,
  getTypes,
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
  const chainId = useChainId();
  const {
    getHubAddressByNetwork,
    getRouterAddressByNetwork,
    getChainId,
    getChainEid,
    getTokenBySymbol
  } = useConfig();
  const client = usePublicClient();
  const { swapData, selectedQuote } = useSwap();
  const sourceChainId = getChainId(swapData.input.network);
  const destinationChainId = getChainId(swapData.output.network);
  const destinationEid = getChainEid(swapData.output.network);
  const hubAddress = getHubAddressByNetwork(swapData.input.network);
  const routerAddress = getRouterAddressByNetwork(swapData.input.network);

  // Helper function to create LayerZero payload like the Solidity function
  const getCreationLzData = () => {
    const options = Options.newOptions()
      .addExecutorLzReceiveOption(1e8, 0)
      .toHex();

    // Encode payload: abi.encode(bytes32(0)) then abi.encode(address(1), payload)
    const randomBytes32 =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    const innerPayload = encodeAbiParameters(parseAbiParameters('bytes32'), [
      randomBytes32
    ]);

    const payload = encodeAbiParameters(parseAbiParameters('address, bytes'), [
      '0x0000000000000000000000000000000000000001',
      innerPayload
    ]);

    return { payload, options };
  };

  const validateOrderConfiguration = (): {
    isValid: boolean;
    error?: string;
  } => {
    if (!address) {
      return { isValid: false, error: 'Please connect your wallet first' };
    }
    if (!swapData.input.tokens.length || !swapData.output.tokens.length) {
      return { isValid: false, error: 'Input and output tokens are required' };
    }

    if (!sourceChainId) {
      return {
        isValid: false,
        error: 'Source chain ID not found for input network'
      };
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

    if (chainId !== sourceChainId) {
      return {
        isValid: false,
        error: `Please switch to ${swapData.input.network} network`
      };
    }

    if (!selectedQuote) {
      return {
        isValid: false,
        error: 'No quote selected for the swap'
      };
    }

    return { isValid: true };
  };

  const { writeContractAsync, isPending, isError, error, isSuccess } =
    useWriteContract();

  // Get the proper payload and options for LayerZero fee estimation
  const lzData = destinationEid ? getCreationLzData() : null;

  const { data: estimatedBridgingFee } = useReadContract({
    address: routerAddress as Address,
    abi: routerAbi,
    functionName: 'estimateLzBridgingFee',
    chainId: sourceChainId,
    args: lzData
      ? [destinationEid, lzData.payload, lzData.options]
      : [0, '0x', '0x'],
    query: {
      enabled:
        !!routerAddress &&
        !!destinationEid &&
        !!lzData &&
        sourceChainId !== destinationChainId
    }
  });

  const { signTypedDataAsync } = useSignTypedData();

  // get latestblock
  const { data: latestBlock } = useBlock({
    blockTag: 'latest'
  });

  // get contract nonce
  const { data: contractNonce } = useReadContract({
    address: hubAddress as Address,
    abi: orderHubAbi,
    functionName: 'nonce',
    chainId: sourceChainId,
    query: {
      enabled: !!hubAddress && !!sourceChainId
    }
  });

  const approval = useApproval({
    tokens:
      swapData.input.tokens.flatMap((t) => {
        const token = getTokenBySymbol(swapData.input.network, t.symbol);
        if (!token) return [];
        const parsedAmount = parseUnits(t.amount.toString(), token.decimals);
        return [tokenToContractFormat(token, parsedAmount)];
      }) || [],
    spenderAddress: hubAddress,
    chainId: getChainId(swapData.input.network)
  });

  const createOrder = async () => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    if (!sourceChainId || !destinationChainId) {
      throw new Error('Source or destination chain ID not found');
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

    if (approval.needsApproval) {
      await approval.execute();
    }

    if (!latestBlock) {
      throw new Error('Latest block not available');
    }

    if (contractNonce === undefined) {
      throw new Error('Contract nonce not available');
    }

    // For cross-chain swaps, bridging fee is required
    if (sourceChainId !== destinationChainId) {
      if (estimatedBridgingFee === undefined) {
        throw new Error('Bridging fee not found for cross-chain swap');
      }
      if (!destinationEid) {
        throw new Error(
          `Cross-chain swap not supported: ${swapData.output.network} network does not have LayerZero endpoint configured`
        );
      }
    }

    const inputs: Token[] = swapData.input.tokens.flatMap((t) => {
      if (safeParseFloat(t.amount) <= 0) {
        return [];
      }
      const token = getTokenBySymbol(swapData.input.network, t.symbol);
      if (!token) {
        return [];
      }
      const parsedAmount = parseUnits(t.amount.toString(), token.decimals);
      return [tokenToContractFormat(token, parsedAmount)];
    });

    const outputs: Token[] = swapData.output.tokens.flatMap((t, index) => {
      const token = getTokenBySymbol(swapData.output.network, t.symbol);
      if (!token) {
        return [];
      }
      const percentage = swapData.outputPercentages[index] || 0;
      const amount = safeParseFloat(t.amount) * (percentage / 100);

      const parsedAmount = parseUnits(amount.toString(), token.decimals);
      return [tokenToContractFormat(token, parsedAmount)];
    });

    const deadlineFillerGap = BigInt(3600); // 1 hour
    const timestamp = latestBlock.timestamp;
    const deadline = timestamp + BigInt(3) * deadlineFillerGap;
    const primaryFillerDeadline = timestamp + BigInt(2) * deadlineFillerGap;

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
      // Calculate native value: sum of native token inputs + bridging fee (if cross-chain)
      const totalValue = orderRequest.order.inputs
        .filter((input) => input.tokenType === TokenType.NATIVE)
        .reduce((total, input) => total + input.amount, BigInt(0));

      const nativeValue =
        sourceChainId !== destinationChainId
          ? totalValue + (estimatedBridgingFee as bigint)
          : totalValue;

      console.log('Creating order with:', {
        hubAddress,
        sourceChainId,
        destinationChainId: getChainId(swapData.output.network),
        currentChainId: chainId,
        destinationEid,
        lzPayload: lzData?.payload,
        lzOptions: lzData?.options,
        estimatedBridgingFee: estimatedBridgingFee?.toString(),
        inputs: orderRequest.order.inputs.map((i) => ({
          type: i.tokenType,
          address: i.tokenAddress,
          amount: i.amount.toString()
        })),
        totalValue: totalValue.toString(),
        nativeValue: nativeValue.toString(),
        nonce: orderRequest.nonce.toString(),
        bridgeSelector: sourceChainId !== destinationChainId ? 1 : 0
      });

      const message = {
        deadline: orderRequest.deadline,
        nonce: orderRequest.nonce,
        order: orderRequest.order
      };

      const signature = await signTypedDataAsync({
        domain: getDomain(sourceChainId, hubAddress),
        types: getTypes(),
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
        permits, // permits array (now properly sized
        signature, // EIP-712 signature
        sourceChainId !== destinationChainId ? 1 : 0,
        sourceChainId !== destinationChainId ? lzData?.options || '0x' : '0x'
      ];

      await client?.estimateContractGas({
        address: hubAddress as Address,
        abi: orderHubAbi,
        functionName: 'createOrder',
        args,
        value: nativeValue,
        account: address as Address
      });

      await writeContractAsync({
        chainId: sourceChainId,
        address: hubAddress as Address,
        abi: orderHubAbi,
        functionName: 'createOrder',
        args,
        value: nativeValue
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
