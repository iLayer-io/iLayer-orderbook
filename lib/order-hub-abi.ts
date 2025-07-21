export const orderHubAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', type: 'address', internalType: 'address' },
      { name: '_router', type: 'address', internalType: 'address' },
      { name: '_trustedForwarder', type: 'address', internalType: 'address' },
      { name: '_maxOrderDeadline', type: 'uint64', internalType: 'uint64' },
      { name: '_timeBuffer', type: 'uint64', internalType: 'uint64' }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'ORDER_REQUEST_TYPEHASH',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'ORDER_TYPEHASH',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'TOKEN_TYPEHASH',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'createOrder',
    inputs: [
      {
        name: 'request',
        type: 'tuple',
        internalType: 'struct Root.OrderRequest',
        components: [
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
          {
            name: 'order',
            type: 'tuple',
            internalType: 'struct Root.Order',
            components: [
              { name: 'user', type: 'bytes32', internalType: 'bytes32' },
              { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
              { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
              {
                name: 'inputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'outputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'sourceChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              {
                name: 'destinationChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              { name: 'sponsored', type: 'bool', internalType: 'bool' },
              {
                name: 'primaryFillerDeadline',
                type: 'uint64',
                internalType: 'uint64'
              },
              { name: 'deadline', type: 'uint64', internalType: 'uint64' },
              {
                name: 'callRecipient',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              { name: 'callValue', type: 'uint256', internalType: 'uint256' }
            ]
          }
        ]
      },
      { name: 'permits', type: 'bytes[]', internalType: 'bytes[]' },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
      {
        name: 'bridgeSelector',
        type: 'uint8',
        internalType: 'enum BaseRouter.Bridge'
      },
      { name: 'extra', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
      { name: '', type: 'uint64', internalType: 'uint64' }
    ],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'domainSeparator',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      { name: 'fields', type: 'bytes1', internalType: 'bytes1' },
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'version', type: 'string', internalType: 'string' },
      { name: 'chainId', type: 'uint256', internalType: 'uint256' },
      { name: 'verifyingContract', type: 'address', internalType: 'address' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      { name: 'extensions', type: 'uint256[]', internalType: 'uint256[]' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getOrderId',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct Root.Order',
        components: [
          { name: 'user', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          { name: 'sourceChainId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'destinationChainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          { name: 'sponsored', type: 'bool', internalType: 'bool' },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64'
          },
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'callRecipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'callValue', type: 'uint256', internalType: 'uint256' }
        ]
      },
      { name: 'nonce', type: 'uint256', internalType: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'pure'
  },
  {
    type: 'function',
    name: 'hashOrder',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct Root.Order',
        components: [
          { name: 'user', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          { name: 'sourceChainId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'destinationChainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          { name: 'sponsored', type: 'bool', internalType: 'bool' },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64'
          },
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'callRecipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'callValue', type: 'uint256', internalType: 'uint256' }
        ]
      }
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'pure'
  },
  {
    type: 'function',
    name: 'hashOrderRequest',
    inputs: [
      {
        name: 'request',
        type: 'tuple',
        internalType: 'struct Root.OrderRequest',
        components: [
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
          {
            name: 'order',
            type: 'tuple',
            internalType: 'struct Root.Order',
            components: [
              { name: 'user', type: 'bytes32', internalType: 'bytes32' },
              { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
              { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
              {
                name: 'inputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'outputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'sourceChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              {
                name: 'destinationChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              { name: 'sponsored', type: 'bool', internalType: 'bool' },
              {
                name: 'primaryFillerDeadline',
                type: 'uint64',
                internalType: 'uint64'
              },
              { name: 'deadline', type: 'uint64', internalType: 'uint64' },
              {
                name: 'callRecipient',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              { name: 'callValue', type: 'uint256', internalType: 'uint256' }
            ]
          }
        ]
      }
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'pure'
  },
  {
    type: 'function',
    name: 'isTrustedForwarder',
    inputs: [{ name: 'forwarder', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'maxOrderDeadline',
    inputs: [],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'nonce',
    inputs: [],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'onERC1155BatchReceived',
    inputs: [
      { name: 'operator', type: 'address', internalType: 'address' },
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'ids', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'values', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'data', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: '', type: 'bytes4', internalType: 'bytes4' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'onERC1155Received',
    inputs: [
      { name: 'operator', type: 'address', internalType: 'address' },
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'value', type: 'uint256', internalType: 'uint256' },
      { name: 'data', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: '', type: 'bytes4', internalType: 'bytes4' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'onERC721Received',
    inputs: [
      { name: 'operator', type: 'address', internalType: 'address' },
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
      { name: 'data', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: '', type: 'bytes4', internalType: 'bytes4' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'onMessageReceived',
    inputs: [
      { name: 'srcChainId', type: 'uint32', internalType: 'uint32' },
      { name: 'data', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'orders',
    inputs: [{ name: 'orderId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'status', type: 'uint8', internalType: 'enum Root.Status' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'requestNonces',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'nonce', type: 'uint64', internalType: 'uint64' }
    ],
    outputs: [{ name: 'used', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'router',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract BaseRouter' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'setMaxOrderDeadline',
    inputs: [
      { name: 'newMaxOrderDeadline', type: 'uint64', internalType: 'uint64' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setRouter',
    inputs: [{ name: 'newRouter', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setSpokeAddress',
    inputs: [
      { name: 'chainId', type: 'uint32', internalType: 'uint32' },
      { name: 'spoke', type: 'bytes32', internalType: 'bytes32' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setTimeBuffer',
    inputs: [{ name: 'newTimeBuffer', type: 'uint64', internalType: 'uint64' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'spokes',
    inputs: [{ name: 'chainId', type: 'uint32', internalType: 'uint32' }],
    outputs: [{ name: 'spoke', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [{ name: 'interfaceId', type: 'bytes4', internalType: 'bytes4' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'timeBuffer',
    inputs: [],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'trustedForwarder',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'validateOrderRequest',
    inputs: [
      {
        name: 'request',
        type: 'tuple',
        internalType: 'struct Root.OrderRequest',
        components: [
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'nonce', type: 'uint64', internalType: 'uint64' },
          {
            name: 'order',
            type: 'tuple',
            internalType: 'struct Root.Order',
            components: [
              { name: 'user', type: 'bytes32', internalType: 'bytes32' },
              { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
              { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
              {
                name: 'inputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'outputs',
                type: 'tuple[]',
                internalType: 'struct Root.Token[]',
                components: [
                  {
                    name: 'tokenType',
                    type: 'uint8',
                    internalType: 'enum Root.Type'
                  },
                  {
                    name: 'tokenAddress',
                    type: 'bytes32',
                    internalType: 'bytes32'
                  },
                  {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256'
                  },
                  { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
              },
              {
                name: 'sourceChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              {
                name: 'destinationChainId',
                type: 'uint32',
                internalType: 'uint32'
              },
              { name: 'sponsored', type: 'bool', internalType: 'bool' },
              {
                name: 'primaryFillerDeadline',
                type: 'uint64',
                internalType: 'uint64'
              },
              { name: 'deadline', type: 'uint64', internalType: 'uint64' },
              {
                name: 'callRecipient',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'callData', type: 'bytes', internalType: 'bytes' },
              { name: 'callValue', type: 'uint256', internalType: 'uint256' }
            ]
          }
        ]
      },
      { name: 'signature', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'withdrawOrder',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct Root.Order',
        components: [
          { name: 'user', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          { name: 'sourceChainId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'destinationChainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          { name: 'sponsored', type: 'bool', internalType: 'bool' },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64'
          },
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'callRecipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'callValue', type: 'uint256', internalType: 'uint256' }
        ]
      },
      { name: 'orderNonce', type: 'uint64', internalType: 'uint64' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'EIP712DomainChanged',
    inputs: [],
    anonymous: false
  },
  {
    type: 'event',
    name: 'ERC1155BatchReceived',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'from',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'ids',
        type: 'uint256[]',
        indexed: false,
        internalType: 'uint256[]'
      },
      {
        name: 'values',
        type: 'uint256[]',
        indexed: false,
        internalType: 'uint256[]'
      },
      { name: 'data', type: 'bytes', indexed: false, internalType: 'bytes' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'ERC1155Received',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'from',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'id',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      { name: 'data', type: 'bytes', indexed: false, internalType: 'bytes' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'ERC721Received',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'from',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      { name: 'data', type: 'bytes', indexed: false, internalType: 'bytes' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'MaxOrderDeadlineUpdated',
    inputs: [
      {
        name: 'oldDeadline',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64'
      },
      {
        name: 'newDeadline',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'OrderCreated',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'nonce',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64'
      },
      {
        name: 'order',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Root.Order',
        components: [
          { name: 'user', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          { name: 'sourceChainId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'destinationChainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          { name: 'sponsored', type: 'bool', internalType: 'bool' },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64'
          },
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'callRecipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'callValue', type: 'uint256', internalType: 'uint256' }
        ]
      },
      {
        name: 'caller',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'OrderSettled',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'order',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Root.Order',
        components: [
          { name: 'user', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'filler', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type'
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32'
              },
              { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
              { name: 'amount', type: 'uint256', internalType: 'uint256' }
            ]
          },
          { name: 'sourceChainId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'destinationChainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          { name: 'sponsored', type: 'bool', internalType: 'bool' },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64'
          },
          { name: 'deadline', type: 'uint64', internalType: 'uint64' },
          { name: 'callRecipient', type: 'bytes32', internalType: 'bytes32' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'callValue', type: 'uint256', internalType: 'uint256' }
        ]
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'OrderWithdrawn',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'caller',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address'
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'RouterUpdated',
    inputs: [
      {
        name: 'oldRouter',
        type: 'address',
        indexed: true,
        internalType: 'address'
      },
      {
        name: 'newRouter',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'SpokeUpdated',
    inputs: [
      {
        name: 'chainId',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32'
      },
      {
        name: 'oldSpokeAddr',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'newSpokeAddr',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'TimeBufferUpdated',
    inputs: [
      {
        name: 'oldTimeBufferVal',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64'
      },
      {
        name: 'newTimeBufferVal',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64'
      }
    ],
    anonymous: false
  },
  { type: 'error', name: 'InsufficientGasValue', inputs: [] },
  { type: 'error', name: 'InvalidDeadline', inputs: [] },
  { type: 'error', name: 'InvalidDestinationChain', inputs: [] },
  { type: 'error', name: 'InvalidOrderInputApprovals', inputs: [] },
  { type: 'error', name: 'InvalidOrderSignature', inputs: [] },
  { type: 'error', name: 'InvalidShortString', inputs: [] },
  { type: 'error', name: 'InvalidSourceChain', inputs: [] },
  { type: 'error', name: 'NativeTransferFailed', inputs: [] },
  { type: 'error', name: 'OrderCannotBeFilled', inputs: [] },
  { type: 'error', name: 'OrderCannotBeWithdrawn', inputs: [] },
  { type: 'error', name: 'OrderDeadlinesMismatch', inputs: [] },
  { type: 'error', name: 'OrderExpired', inputs: [] },
  { type: 'error', name: 'OrderPrimaryFillerExpired', inputs: [] },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }]
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }]
  },
  { type: 'error', name: 'PermitFailure', inputs: [] },
  { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
  { type: 'error', name: 'RequestExpired', inputs: [] },
  { type: 'error', name: 'RequestNonceReused', inputs: [] },
  { type: 'error', name: 'RestrictedToRouter', inputs: [] },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }]
  },
  {
    type: 'error',
    name: 'StringTooLong',
    inputs: [{ name: 'str', type: 'string', internalType: 'string' }]
  },
  { type: 'error', name: 'UndefinedSpoke', inputs: [] },
  { type: 'error', name: 'UnsupportedTransfer', inputs: [] }
];
