import { Config } from '../types/swap';

export const config: Config = [
  {
    name: 'Ethereum',
    nativeToken: 'ETH',
    decimals: 18,
    icon: 'ethereum.png',
    chainId: 1,
    contracts: {
      hub: null,
      spoke: null,
      router: null
    },
    tokens: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: [
      {
        name: 'Aave',
        icon: 'aave.png',
        tokens: [
          {
            name: 'AAVE Tether USD',
            symbol: 'aUSDT',
            address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
            decimals: 6,
            icon: 'ausdt.webp',
            yield: 7.22,
            coingeckoId: 'aave-usdt'
          },
          {
            name: 'AAVE USD Coin',
            symbol: 'aUSDC',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            decimals: 6,
            icon: 'ausdc.webp',
            yield: 9.26,
            coingeckoId: 'aave-usdc'
          }
        ]
      },
      {
        name: 'Compound',
        icon: 'compound.png',
        tokens: [
          {
            name: 'Compound Ethereum',
            symbol: 'cETH',
            address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
            decimals: 8,
            icon: 'ceth.webp',
            yield: 2.05,
            coingeckoId: 'compound-ether'
          },
          {
            name: 'Compound USD Coin',
            symbol: 'cUSDC',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            decimals: 8,
            icon: 'cusdc.webp',
            yield: 10.82,
            coingeckoId: 'compound-usd-coin'
          }
        ]
      }
    ]
  },
  {
    name: 'Arbitrum',
    nativeToken: 'ETH',
    decimals: 18,
    icon: 'arbitrum.png',
    chainId: 42161,
    chainEid: 30110,
    contracts: {
      hub: '0x5c9299F6FdE5d92Ee911e018b390838950435FAC',
      spoke: '0x6C6101a69C5dEC87Ccd4D2e14eDBCB34E7a81984',
      router: '0xa568174D5dbb2fa29E5057D70e50DAE5D84170F8'
    },
    tokens: [
      {
        name: 'Arbitrum',
        symbol: 'ARB',
        address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        decimals: 18,
        icon: 'arb.webp',
        coingeckoId: 'arbitrum'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        decimals: 6,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: [
      {
        name: 'Aave',
        icon: 'aave.png',
        tokens: [
          {
            name: 'AAVE Tether USD',
            symbol: 'aUSDT',
            address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
            decimals: 6,
            icon: 'ausdt.webp',
            yield: 7.22,
            coingeckoId: 'aave-usdt'
          },
          {
            name: 'AAVE USD Coin',
            symbol: 'aUSDC',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            decimals: 6,
            icon: 'ausdc.webp',
            yield: 9.26,
            coingeckoId: 'aave-usdc'
          }
        ]
      },
      {
        name: 'Compound',
        icon: 'compound.png',
        tokens: [
          {
            name: 'Compound Ethereum',
            symbol: 'cETH',
            address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
            decimals: 8,
            icon: 'ceth.webp',
            yield: 2.05,
            coingeckoId: 'compound-ether'
          },
          {
            name: 'Compound USD Coin',
            symbol: 'cUSDC',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            decimals: 8,
            icon: 'cusdc.webp',
            yield: 10.82,
            coingeckoId: 'compound-usd-coin'
          }
        ]
      }
    ]
  },
  {
    name: 'Optimism',
    nativeToken: 'ETH',
    decimals: 18,
    icon: 'optimism.png',
    chainId: 10,
    contracts: {
      hub: null,
      spoke: null,
      router: null
    },
    tokens: [
      {
        name: 'Optimism',
        symbol: 'OP',
        address: '0x4200000000000000000000000000000000000042',
        decimals: 18,
        icon: 'op.webp',
        coingeckoId: 'optimism'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        decimals: 6,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        decimals: 6,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: []
  },
  {
    name: 'Base',
    nativeToken: 'ETH',
    decimals: 18,
    icon: 'base.png',
    chainId: 8453,
    chainEid: 30184,
    contracts: {
      hub: '0x5c9299F6FdE5d92Ee911e018b390838950435FAC',
      spoke: '0x6C6101a69C5dEC87Ccd4D2e14eDBCB34E7a81984',
      router: '0xa568174D5dbb2fa29E5057D70e50DAE5D84170F8'
    },
    tokens: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000002',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0x0000000000000000000000000000000000000003',
        decimals: 18,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x0000000000000000000000000000000000000004',
        decimals: 18,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: [
      {
        name: 'Aave',
        icon: 'aave.png',
        tokens: [
          {
            name: 'AAVE Tether USD',
            symbol: 'aUSDT',
            address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
            decimals: 6,
            icon: 'ausdt.webp',
            yield: 7.22,
            coingeckoId: 'aave-usdt'
          },
          {
            name: 'AAVE USD Coin',
            symbol: 'aUSDC',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            decimals: 6,
            icon: 'ausdc.webp',
            yield: 9.26,
            coingeckoId: 'aave-usdc'
          }
        ]
      },
      {
        name: 'Compound',
        icon: 'compound.png',
        tokens: [
          {
            name: 'Compound Ethereum',
            symbol: 'cETH',
            address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
            decimals: 8,
            icon: 'ceth.webp',
            yield: 2.05,
            coingeckoId: 'compound-ether'
          },
          {
            name: 'Compound USD Coin',
            symbol: 'cUSDC',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            decimals: 8,
            icon: 'cusdc.webp',
            yield: 10.82,
            coingeckoId: 'compound-usd-coin'
          }
        ]
      }
    ]
  },
  {
    name: 'Polygon',
    nativeToken: 'POL',
    decimals: 18,
    icon: 'polygon.png',
    chainId: 137,
    contracts: {
      hub: null,
      spoke: null,
      router: null
    },
    tokens: [
      {
        name: 'Polygon',
        symbol: 'POL',
        address: '0x0000000000000000000000000000000000000005',
        decimals: 18,
        icon: 'pol.webp',
        coingeckoId: 'polygon-ecosystem-token'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000006',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0x0000000000000000000000000000000000000007',
        decimals: 18,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x0000000000000000000000000000000000000008',
        decimals: 18,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: [
      {
        name: 'Aave',
        icon: 'aave.png',
        tokens: [
          {
            name: 'AAVE Tether USD',
            symbol: 'aUSDT',
            address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
            decimals: 6,
            icon: 'ausdt.webp',
            yield: 7.22,
            coingeckoId: 'aave-usdt'
          },
          {
            name: 'AAVE USD Coin',
            symbol: 'aUSDC',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            decimals: 6,
            icon: 'ausdc.webp',
            yield: 9.26,
            coingeckoId: 'aave-usdc'
          }
        ]
      },
      {
        name: 'Compound',
        icon: 'compound.png',
        tokens: [
          {
            name: 'Compound Ethereum',
            symbol: 'cETH',
            address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
            decimals: 8,
            icon: 'ceth.webp',
            yield: 2.05,
            coingeckoId: 'compound-ether'
          },
          {
            name: 'Compound USD Coin',
            symbol: 'cUSDC',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            decimals: 8,
            icon: 'cusdc.webp',
            yield: 10.82,
            coingeckoId: 'compound-usd-coin'
          }
        ]
      }
    ]
  },
  {
    name: 'Avalanche',
    nativeToken: 'AVAX',
    decimals: 18,
    icon: 'avalanche.png',
    chainId: 43114,
    contracts: {
      hub: null,
      spoke: null,
      router: null
    },
    tokens: [
      {
        name: 'Avalanche',
        symbol: 'AVAX',
        address: '0x0000000000000000000000000000000000000005',
        decimals: 18,
        icon: 'avax.webp',
        coingeckoId: 'avalanche-2'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000006',
        decimals: 18,
        icon: 'eth.webp',
        coingeckoId: 'ethereum'
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0x0000000000000000000000000000000000000007',
        decimals: 18,
        icon: 'usdt.webp',
        coingeckoId: 'tether'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x0000000000000000000000000000000000000008',
        decimals: 18,
        icon: 'usdc.webp',
        coingeckoId: 'usd-coin'
      }
    ],
    defi: [
      {
        name: 'Aave',
        icon: 'aave.png',
        tokens: [
          {
            name: 'AAVE Tether USD',
            symbol: 'aUSDT',
            address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
            decimals: 6,
            icon: 'ausdt.webp',
            yield: 7.22,
            coingeckoId: 'aave-usdt'
          },
          {
            name: 'AAVE USD Coin',
            symbol: 'aUSDC',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            decimals: 6,
            icon: 'ausdc.webp',
            yield: 9.26,
            coingeckoId: 'aave-usdc'
          }
        ]
      }
    ]
  }
];
