import { pad, Address, concat, parseSignature, encodePacked } from 'viem';
import { TokenOrDefiToken } from '@/types';

const pad32 = (value: Address) => pad(value, { size: 32 });

// Enum per il tipo di token (corrisponde al contratto)
enum TokenType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
  NATIVE = 3
}

// Interfacce che corrispondono alle struct del contratto
interface Token {
  tokenType: number;
  tokenAddress: string; // bytes32
  tokenId: bigint;
  amount: bigint;
}

interface Order {
  user: string; // bytes32
  recipient: string; // bytes32
  filler: string; // bytes32
  inputs: Token[];
  outputs: Token[];
  sourceChainId: number;
  destinationChainId: number;
  sponsored: boolean;
  primaryFillerDeadline: bigint;
  deadline: bigint;
  callRecipient: string; // bytes32
  callData: string; // bytes
  callValue: bigint;
}

interface OrderRequest {
  deadline: bigint;
  nonce: bigint;
  order: Order;
}

export function prepareSignatureData(
  contractDomainSeparator: `0x${string}`,
  contractOrderRequestHash: `0x${string}`
): `0x${string}` {
  const data = concat([
    '0x1901',
    contractDomainSeparator,
    contractOrderRequestHash
  ]);

  return data;
}

export function toSignature(signature: `0x${string}`): `0x${string}` {
  const { r, s, v } = parseSignature(signature);

  if (!v) {
    throw new Error('Invalid signature: v is missing');
  }

  return encodePacked(
    ['bytes32', 'bytes32', 'uint8'],
    [r, s, Number(v)]
  ) as `0x${string}`;
}

export function tokenToContractFormat(
  token: TokenOrDefiToken,
  amount: bigint
): Token {
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  const isNative = !token.address || token.address === NULL_ADDRESS;

  // Convert address to bytes32 using pad from viem
  const addressAsBytes32 = token.address ? pad32(token.address) : pad32('0x0');

  return {
    tokenType: isNative ? TokenType.NATIVE : TokenType.ERC20,
    tokenAddress: addressAsBytes32,
    tokenId: BigInt(0),
    amount
  };
}

export function prepareOrderRequest(
  user: Address,
  inputs: Token[],
  outputs: Token[],
  sourceChainId: number,
  destinationChainId: number,
  deadline: bigint,
  nonce: bigint,
  primaryFillerDeadline?: bigint
): OrderRequest {
  const paddedUserAddress = pad(user as `0x${string}`, { size: 32 });
  const paddedRecipientAddress = paddedUserAddress; // Same as user for now
  const paddedFillerAddress = paddedUserAddress; // Same as user for now
  const paddedCallRecipient = paddedRecipientAddress;

  return {
    deadline,
    nonce,
    order: {
      user: paddedUserAddress,
      recipient: paddedRecipientAddress,
      filler: paddedFillerAddress,
      inputs: inputs.map((input) => ({
        ...input,
        tokenAddress: pad(input.tokenAddress as `0x${string}`, { size: 32 })
      })),
      outputs: outputs.map((output) => ({
        ...output,
        tokenAddress: pad(output.tokenAddress as `0x${string}`, { size: 32 })
      })),
      sourceChainId,
      destinationChainId,
      sponsored: false,
      primaryFillerDeadline: primaryFillerDeadline || deadline,
      deadline,
      callRecipient: paddedCallRecipient,
      callData: '0x',
      callValue: BigInt(0)
    }
  };
}

export enum OrderHubError {
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
export const getErrorMessage = (error: any): string => {
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

// Esporta i tipi per l'uso in altri file
export type { Token, Order, OrderRequest };
export { TokenType };
