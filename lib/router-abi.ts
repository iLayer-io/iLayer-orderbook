export const routerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address'
      },
      {
        name: '_router',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'allowInitializePath',
    inputs: [
      {
        name: 'origin',
        type: 'tuple',
        internalType: 'struct Origin',
        components: [
          {
            name: 'srcEid',
            type: 'uint32',
            internalType: 'uint32'
          },
          {
            name: 'sender',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64'
          }
        ]
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'chainIdToLzChainEid',
    inputs: [
      {
        name: 'chainId',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    outputs: [
      {
        name: 'lzEid',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'endpoint',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ILayerZeroEndpointV2'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'estimateLzBridgingFee',
    inputs: [
      {
        name: 'dstEid',
        type: 'uint32',
        internalType: 'uint32'
      },
      {
        name: 'payload',
        type: 'bytes',
        internalType: 'bytes'
      },
      {
        name: 'options',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'isComposeMsgSender',
    inputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Origin',
        components: [
          {
            name: 'srcEid',
            type: 'uint32',
            internalType: 'uint32'
          },
          {
            name: 'sender',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64'
          }
        ]
      },
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes'
      },
      {
        name: '_sender',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'lzChainEidToChainId',
    inputs: [
      {
        name: 'lzEid',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    outputs: [
      {
        name: 'chainId',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'lzReceive',
    inputs: [
      {
        name: '_origin',
        type: 'tuple',
        internalType: 'struct Origin',
        components: [
          {
            name: 'srcEid',
            type: 'uint32',
            internalType: 'uint32'
          },
          {
            name: 'sender',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64'
          }
        ]
      },
      {
        name: '_guid',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: '_message',
        type: 'bytes',
        internalType: 'bytes'
      },
      {
        name: '_executor',
        type: 'address',
        internalType: 'address'
      },
      {
        name: '_extraData',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'nextNonce',
    inputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32'
      },
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    outputs: [
      {
        name: 'nonce',
        type: 'uint64',
        internalType: 'uint64'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'oAppVersion',
    inputs: [],
    outputs: [
      {
        name: 'senderVersion',
        type: 'uint64',
        internalType: 'uint64'
      },
      {
        name: 'receiverVersion',
        type: 'uint64',
        internalType: 'uint64'
      }
    ],
    stateMutability: 'pure'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'peers',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    outputs: [
      {
        name: 'peer',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
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
    name: 'send',
    inputs: [
      {
        name: 'message',
        type: 'tuple',
        internalType: 'struct BaseRouter.Message',
        components: [
          {
            name: 'bridge',
            type: 'uint8',
            internalType: 'enum BaseRouter.Bridge'
          },
          {
            name: 'chainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          {
            name: 'destination',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'payload',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'extra',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'sender',
            type: 'bytes32',
            internalType: 'bytes32'
          }
        ]
      }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'setDelegate',
    inputs: [
      {
        name: '_delegate',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setLzEid',
    inputs: [
      {
        name: 'chainId',
        type: 'uint32',
        internalType: 'uint32'
      },
      {
        name: 'lzEid',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setPeer',
    inputs: [
      {
        name: '_eid',
        type: 'uint32',
        internalType: 'uint32'
      },
      {
        name: '_peer',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'setWhitelisted',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'status',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'whitelisted',
    inputs: [
      {
        name: 'caller',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: 'status',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'LzEidUpdated',
    inputs: [
      {
        name: 'chainId',
        type: 'uint32',
        indexed: true,
        internalType: 'uint32'
      },
      {
        name: 'lzEid',
        type: 'uint32',
        indexed: true,
        internalType: 'uint32'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'MessageBroadcasted',
    inputs: [
      {
        name: 'message',
        type: 'tuple',
        indexed: false,
        internalType: 'struct BaseRouter.Message',
        components: [
          {
            name: 'bridge',
            type: 'uint8',
            internalType: 'enum BaseRouter.Bridge'
          },
          {
            name: 'chainId',
            type: 'uint32',
            internalType: 'uint32'
          },
          {
            name: 'destination',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'payload',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'extra',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'sender',
            type: 'bytes32',
            internalType: 'bytes32'
          }
        ]
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'MessageRoutedLz',
    inputs: [
      {
        name: 'msg',
        type: 'tuple',
        indexed: false,
        internalType: 'struct MessagingReceipt',
        components: [
          {
            name: 'guid',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64'
          },
          {
            name: 'fee',
            type: 'tuple',
            internalType: 'struct MessagingFee',
            components: [
              {
                name: 'nativeFee',
                type: 'uint256',
                internalType: 'uint256'
              },
              {
                name: 'lzTokenFee',
                type: 'uint256',
                internalType: 'uint256'
              }
            ]
          }
        ]
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
    name: 'PeerSet',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32'
      },
      {
        name: 'peer',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'WhitelistUpdated',
    inputs: [
      {
        name: 'target',
        type: 'address',
        indexed: true,
        internalType: 'address'
      },
      {
        name: 'previousStatus',
        type: 'bool',
        indexed: false,
        internalType: 'bool'
      },
      {
        name: 'newStatus',
        type: 'bool',
        indexed: false,
        internalType: 'bool'
      }
    ],
    anonymous: false
  },
  {
    type: 'error',
    name: 'InvalidDelegate',
    inputs: []
  },
  {
    type: 'error',
    name: 'InvalidEndpointCall',
    inputs: []
  },
  {
    type: 'error',
    name: 'LzTokenUnavailable',
    inputs: []
  },
  {
    type: 'error',
    name: 'NoPeer',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32'
      }
    ]
  },
  {
    type: 'error',
    name: 'NotEnoughNative',
    inputs: [
      {
        name: 'msgValue',
        type: 'uint256',
        internalType: 'uint256'
      }
    ]
  },
  {
    type: 'error',
    name: 'NotWhitelisted',
    inputs: []
  },
  {
    type: 'error',
    name: 'OnlyEndpoint',
    inputs: [
      {
        name: 'addr',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'OnlyPeer',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32'
      },
      {
        name: 'sender',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ]
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address'
      }
    ]
  },
  {
    type: 'error',
    name: 'UnsupportedBridgingRoute',
    inputs: []
  },
  {
    type: 'error',
    name: 'UnsupportedLzChain',
    inputs: []
  }
];
