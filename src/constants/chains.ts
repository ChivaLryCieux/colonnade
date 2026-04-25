import type { ChainType, ChainConfig } from '../types/chain'

export const CHAIN_CONFIG: Record<ChainType, ChainConfig> = {
  btc: {
    id: 'btc-mainnet',
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    explorer: 'https://blockchain.com',
  },
  eth: {
    id: '1',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    explorer: 'https://etherscan.io',
  },
  sol: {
    id: 'sol-mainnet',
    name: 'Solana',
    symbol: 'SOL',
    color: '#14F195',
    explorer: 'https://explorer.solana.com',
  },
}

export const DEFAULT_CHAIN: ChainType = 'btc'
