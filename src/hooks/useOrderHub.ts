'use client';

import { useState, useMemo } from 'react';
import {
  useWriteContract,
  useAccount,
  useChainId,
  usePublicClient,
  useSignMessage,
  useReadContract
} from 'wagmi';
import { Address, parseUnits, pad } from 'viem';
import { orderHubAbi } from '@/abi/order-hub-abi';
import { useSwapContext } from '@/contexts/SwapContext';
import { useConfig } from '@/contexts/ConfigContext';
import {
  prepareOrderRequest,
  tokenToContractFormat,
  TokenType,
  type Token,
  prepareSignatureData
} from './signature';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// OrderHub specific errors
enum OrderHubError {
  REQUEST_NONCE_REUSED = 'RequestNonceReused',
  REQUEST_EXPIRED = 'RequestExpired',
  UNDEFINED_SPOKE = 'UndefinedSpoke',
  INVALID_ORDER_INPUT_APPROVALS = 'InvalidOrderInputApprovals',
  INVALID_ORDER_SIGNATURE = 'InvalidOrderSignature',
  INVALID_DEADLINE = 'InvalidDeadline',
  INVALID_SOURCE_CHAIN = 'InvalidSourceChain',
  INVALID_DESTINATION_CHAIN = 'InvalidDestinationChain',
  ORDER_DEADLINES_MISMATCH = 'OrderDeadlinesMismatch',
  ORDER_PRIMARY_FILLER_EXPIRED = 'OrderPrimaryFillerExpired',
  ORDER_CANNOT_BE_WITHDRAWN = 'OrderCannotBeWithdrawn',
  ORDER_CANNOT_BE_FILLED = 'OrderCannotBeFilled',
  ORDER_EXPIRED = 'OrderExpired',
  INSUFFICIENT_GAS_VALUE = 'InsufficientGasValue'
}

// Helper function per tradurre gli errori del contratto in messaggi user-friendly
const getErrorMessage = (error: any): string => {
  const errorMessage = error?.message || error?.toString() || '';

  // Controlla prima gli errori di network
  if (errorMessage.includes('Chain ID') || errorMessage.includes('chain')) {
    return errorMessage; // Restituisci il messaggio originale per errori di chain
  }

  if (errorMessage.includes('Wrong network')) {
    return errorMessage; // Restituisci il messaggio originale per errori di network
  }

  // Controlla errori di gas estremi
  if (
    errorMessage.includes('gas') &&
    (errorMessage.includes('million') || errorMessage.includes('billion'))
  ) {
    return 'Gas estimation failed. This usually means you are on the wrong network. Please check your network connection.';
  }

  if (errorMessage.includes(OrderHubError.REQUEST_NONCE_REUSED)) {
    return 'This order request has already been used. Please try again with a new order.';
  }
  if (errorMessage.includes(OrderHubError.REQUEST_EXPIRED)) {
    return 'The order request has expired. Please create a new order.';
  }
  if (errorMessage.includes(OrderHubError.UNDEFINED_SPOKE)) {
    return 'The destination network is not supported for this operation.';
  }
  if (errorMessage.includes(OrderHubError.INVALID_ORDER_INPUT_APPROVALS)) {
    return 'Token approvals are missing or invalid. Please approve tokens first.';
  }
  if (errorMessage.includes(OrderHubError.INVALID_ORDER_SIGNATURE)) {
    return 'Invalid order signature. Please try signing the order again.';
  }
  if (errorMessage.includes(OrderHubError.INVALID_DEADLINE)) {
    return 'Order deadline is too far in the future. Please use a shorter deadline.';
  }
  if (errorMessage.includes(OrderHubError.INVALID_SOURCE_CHAIN)) {
    return 'Source chain mismatch. Please switch to the correct network.';
  }
  if (errorMessage.includes(OrderHubError.ORDER_DEADLINES_MISMATCH)) {
    return 'Order deadlines configuration is invalid.';
  }
  if (errorMessage.includes(OrderHubError.ORDER_EXPIRED)) {
    return 'Order has expired. Please create a new order with a future deadline.';
  }
  if (errorMessage.includes(OrderHubError.INSUFFICIENT_GAS_VALUE)) {
    return 'Insufficient native token value sent. Please check your transaction value.';
  }

  // Generic error handling
  if (errorMessage.includes('insufficient funds')) {
    return 'Insufficient funds in your wallet.';
  }
  if (errorMessage.includes('user rejected')) {
    return 'Transaction was rejected by user.';
  }
  if (errorMessage.includes('gas')) {
    return 'Transaction failed due to gas issues. Please try increasing gas limit or check if you are on the correct network.';
  }

  return `Transaction failed: ${errorMessage}`;
};

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

// Funzione per calcolare il valore nativo necessario
const calculateNativeValue = (inputs: Token[]): bigint => {
  return inputs
    .filter((input) => input.tokenType === TokenType.NATIVE)
    .reduce((total, input) => total + input.amount, BigInt(0));
};

export const useOrderHub = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { swapData } = useSwapContext();
  const { config } = useConfig();

  const { writeContract, isPending, isError, error, isSuccess } =
    useWriteContract();

  const { signMessageAsync } = useSignMessage();

  const hubAddress = getHubAddressByNetwork(swapData.input.network, config);

  const orderRequest = useMemo(() => {
    if (
      !address ||
      !hubAddress ||
      !swapData.input.network ||
      !swapData.output.network
    ) {
      return null;
    }

    const hasValidInputs = swapData.input.tokens.some((t: any) => t.amount > 0);
    if (!hasValidInputs || !swapData.output.tokens.length) {
      return null;
    }

    try {
      const sourceChainId = getChainIdByNetwork(swapData.input.network);
      const destinationChainId = getChainIdByNetwork(swapData.output.network);

      const inputs: Token[] = swapData.input.tokens
        .filter((t) => t.amount > 0)
        .map((t) => {
          const parsedAmount = parseUnits(
            t.amount.toString(),
            t.token.decimals
          );
          return tokenToContractFormat(t.token, parsedAmount);
        });

      const outputs: Token[] = swapData.output.tokens.map((t, index) => {
        const percentage = swapData.outputPercentages[index] || 0;
        const amount = t.amount * (percentage / 100);
        const parsedAmount = parseUnits(amount.toString(), t.token.decimals);
        return tokenToContractFormat(t.token, parsedAmount);
      });

      // TODO: take from settings
      const maxDeadlineHours = 24;
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + maxDeadlineHours * 3600
      );
      const nonce = BigInt(Math.floor(Math.random() * 1000000000));

      return prepareOrderRequest(
        address,
        inputs,
        outputs,
        sourceChainId,
        destinationChainId,
        deadline,
        nonce
      );
    } catch (error) {
      console.error('Error preparing order request:', error);
      return null;
    }
  }, [
    address,
    hubAddress,
    swapData.input.network,
    swapData.output.network,
    swapData.input.tokens,
    swapData.output.tokens,
    swapData.outputPercentages,
    // Aggiorna ogni minuto per il nonce e deadline
    Math.floor(Date.now() / 60000)
  ]);

  // Leggi il domainSeparator dal contratto
  const { data: contractDomainSeparator, isError: domainSeparatorError } =
    useReadContract({
      address: hubAddress as Address,
      abi: orderHubAbi,
      functionName: 'domainSeparator',
      chainId: getChainIdByNetwork(swapData.input.network),
      query: {
        enabled: !!hubAddress && !!swapData.input.network
      }
    });

  // Leggi l'hash dell'OrderRequest dal contratto quando disponibile
  const { data: contractOrderRequestHash, isError: orderRequestHashError } =
    useReadContract({
      address: hubAddress as Address,
      abi: orderHubAbi,
      functionName: 'hashOrderRequest',
      args: orderRequest ? [orderRequest] : undefined,
      chainId: getChainIdByNetwork(swapData.input.network),
      query: {
        enabled: !!hubAddress && !!swapData.input.network && !!orderRequest
      }
    });

  // Controlla se tutti i dati necessari sono pronti
  const isReadyToSign = !!(
    contractDomainSeparator &&
    orderRequest &&
    contractOrderRequestHash
  );

  const createOrder = async () => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    const sourceChainId = getChainIdByNetwork(swapData.input.network);
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

    if (!contractDomainSeparator) {
      throw new Error(
        'Domain separator not available from contract. Please ensure you are connected to the correct network.'
      );
    }

    if (!contractOrderRequestHash) {
      throw new Error(
        'Failed to read order request hash from contract. Please ensure you are connected to the correct network.'
      );
    }

    if (!orderRequest) {
      throw new Error(
        'Order request not ready. Please check your input and output tokens.'
      );
    }

    if (!isReadyToSign) {
      throw new Error(
        'Order data not ready. Please ensure domain separator and order request hash are available from contract.'
      );
    }

    const nativeValue = calculateNativeValue(orderRequest.order.inputs);

    try {
      const sourceChainId = getChainIdByNetwork(swapData.input.network);
      const destinationChainId = getChainIdByNetwork(swapData.output.network);

      console.log('Creating order with:', {
        hubAddress,
        sourceChainId,
        destinationChainId,
        currentChainId: chainId,
        inputs: orderRequest.order.inputs.map((i) => ({
          type: i.tokenType,
          address: i.tokenAddress,
          amount: i.amount.toString()
        })),
        nativeValue: nativeValue.toString(),
        contractDomainSeparator,
        contractOrderRequestHash
      });

      const message = prepareSignatureData(
        contractDomainSeparator as `0x${string}`,
        contractOrderRequestHash as `0x${string}`
      );
      const signature = await signMessageAsync({ message });

      const args = [
        orderRequest, // OrderRequest struct
        [], // permits array (empty for now)
        signature, // EIP-712 signature
        BridgeSelector.NONE, // bridge selector
        '0x' // extra data
      ];

      const estimatedGas = (await publicClient?.estimateContractGas({
        address: hubAddress as Address,
        abi: orderHubAbi,
        functionName: 'createOrder',
        args,
        value: nativeValue
      })) as bigint;

      console.log('Estimated gas:', estimatedGas.toString());

      writeContract({
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
    isPending,
    isError,
    error: error ? new Error(getErrorMessage(error)) : null,
    isSuccess,
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
