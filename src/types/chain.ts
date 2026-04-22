export type ChainType = 'eth' | 'btc' | 'sol'

export interface ChainConfig {
  id: string
  name: string
  symbol: string
  color: string
  explorer: string
}

export interface BaseBlock {
  number: bigint
  transactions: number
}

export interface EthBlock {
  chain?: 'eth'
  gasUsed?: bigint
  gasLimit?: bigint
}

export interface BtcBlock {
  chain?: 'btc'
  difficulty?: bigint
  size?: number
  weight?: number
  hash?: string
  prevHash?: string
  timestamp?: bigint
}

export interface SolBlock {
  chain?: 'sol'
  slot?: bigint
  leader?: string
  hash?: string
  timestamp?: bigint
}
