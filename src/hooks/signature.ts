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
  nonce: bigint
): OrderRequest {
  const order: Order = {
    user: pad32(user), // Convert Address to bytes32
    // TODO: take from settings or default to user address
    recipient: pad32(user),
    filler: pad32('0x0'),
    inputs,
    outputs,
    sourceChainId,
    destinationChainId,
    sponsored: false,
    primaryFillerDeadline: deadline - BigInt(600), // 10 minuti di buffer
    deadline,
    callRecipient: pad32('0x0'),
    callData: '0x',
    callValue: BigInt(0)
  };

  return {
    deadline,
    nonce,
    order
  };
}

// Esporta i tipi per l'uso in altri file
export type { Token, Order, OrderRequest };
export { TokenType };
