'use client';

import {
  useWriteContract,
  useAccount,
  useChainId,
  usePublicClient
} from 'wagmi';
import { Address, encodeAbiParameters, parseUnits } from 'viem';
import { orderHubAbi } from '@/abi/order-hub-abi';
import { useSwapContext } from '@/contexts/SwapContext';
import { useConfig } from '@/contexts/ConfigContext';
import { TokenOrDefiToken } from '@/types';

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

// Enum per il tipo di token
enum TokenType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
  NATIVE = 3
}

// Enum per il bridge selector
enum BridgeSelector {
  NONE = 0,
  WORMHOLE = 1,
  CCTP = 2,
  HYPERLANE = 3
}

interface Token {
  tokenType: number;
  tokenAddress: Address;
  tokenId: bigint;
  amount: bigint;
}

interface Order {
  user: Address;
  recipient: Address;
  filler: Address;
  inputs: Token[];
  outputs: Token[];
  sourceChainId: number;
  destinationChainId: number;
  sponsored: boolean;
  primaryFillerDeadline: bigint;
  deadline: bigint;
  callRecipient: Address;
  callData: Address;
  callValue: bigint;
}

interface OrderRequest {
  deadline: bigint;
  nonce: bigint;
  order: Order;
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

  // Verifica che il contratto spoke sia disponibile per la rete di output
  const outputNetwork = config.find(
    (net: any) =>
      net.name.toLowerCase() === swapData.output.network.toLowerCase()
  );
  if (!outputNetwork?.contracts?.spoke) {
    return {
      isValid: false,
      error: `Spoke contract not available for destination network: ${swapData.output.network}`
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

// Helper function per convertire un token in formato contratto
const tokenToContractFormat = (
  token: TokenOrDefiToken,
  amount: number
): Token => {
  const isNative = !token.address || token.address === NULL_ADDRESS;
  if (amount <= 0) {
    throw new Error(`Invalid token amount: ${amount}`);
  }

  let parsedAmount: bigint;
  try {
    parsedAmount = parseUnits(amount.toString(), token.decimals);
  } catch (error) {
    throw new Error(
      `Failed to parse amount ${amount} for token ${token.symbol}: ${error}`
    );
  }

  console.log(
    `Converting token ${
      token.symbol
    }: ${amount} -> ${parsedAmount.toString()} (decimals: ${token.decimals})`
  );

  return {
    tokenType: isNative ? TokenType.NATIVE : TokenType.ERC20,
    tokenAddress: encodeAbiParameters(
      [{ type: 'address' }],
      [token.address || NULL_ADDRESS]
    ),
    amount: parsedAmount,
    //TODO: check if this is correct
    tokenId: BigInt(0)
  };
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

  const createOrder = async () => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    // Ottieni l'indirizzo del contratto hub dalla configurazione
    const hubAddress = getHubAddressByNetwork(swapData.input.network, config);

    const sourceChainId = getChainIdByNetwork(swapData.input.network);
    const destinationChainId = getChainIdByNetwork(swapData.output.network);

    // Converti i token input
    const inputs: Token[] = swapData.input.tokens
      .filter((t) => t.amount > 0)
      .map((t) => tokenToContractFormat(t.token, t.amount));

    // Converti i token output
    const outputs: Token[] = swapData.output.tokens.map((t, index) => {
      const percentage = swapData.outputPercentages[index] || 0;
      const amount = t.amount * (percentage / 100);
      return tokenToContractFormat(t.token, amount);
    });

    // Calcola deadline con validazione (massimo 24 ore per sicurezza)
    const maxDeadlineHours = 24;
    const deadline = BigInt(
      Math.floor(Date.now() / 1000) + maxDeadlineHours * 3600
    );
    const nonce = BigInt(Math.floor(Math.random() * 1000000000)); // Nonce più grande per ridurre collisioni

    // Validazione delle deadline
    const primaryFillerBuffer = BigInt(600); // 10 minuti di buffer per il primary filler
    const primaryFillerDeadline = deadline - primaryFillerBuffer;

    if (primaryFillerDeadline <= BigInt(Math.floor(Date.now() / 1000))) {
      throw new Error('Invalid deadline configuration. Please try again.');
    }

    const order: Order = {
      user: encodeAbiParameters([{ type: 'address' }], [address]),
      recipient: encodeAbiParameters([{ type: 'address' }], [address]),
      inputs,
      outputs,
      sourceChainId,
      destinationChainId,
      sponsored: false,
      primaryFillerDeadline,
      deadline,
      //TODO: check if those are correct
      filler: encodeAbiParameters([{ type: 'address' }], [NULL_ADDRESS]),
      callRecipient: encodeAbiParameters([{ type: 'address' }], [NULL_ADDRESS]),
      callData: '0x',
      callValue: BigInt(0)
    };

    const orderRequest: OrderRequest = {
      deadline,
      nonce,
      order
    };

    // Calcola il valore nativo necessario
    const nativeValue = calculateNativeValue(inputs);

    try {
      console.log('Creating order with:', {
        hubAddress,
        sourceChainId,
        destinationChainId,
        currentChainId: chainId,
        inputs: inputs.map((i) => ({
          type: i.tokenType,
          address: i.tokenAddress,
          amount: i.amount.toString()
        })),
        nativeValue: nativeValue.toString()
      });

      // Verifica finale che siamo sulla chain corretta
      if (chainId !== sourceChainId) {
        throw new Error(
          `Wrong network! Please switch to ${swapData.input.network} (Chain ID: ${sourceChainId}). Currently on Chain ID: ${chainId}`
        );
      }

      const args = [
        orderRequest,
        // TODO: Permits, signature, bridgeSelector, extra
        [],
        NULL_ADDRESS,
        BridgeSelector.NONE,
        NULL_ADDRESS
      ];

      console.log('Order args:', args);

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
