import type { BaseBlock, EthBlock, BtcBlock, SolBlock } from './chain'

export type { ChainType } from './chain'

export type BlockPoint = BaseBlock & (
  | (EthBlock & { chain?: 'eth' })
  | (BtcBlock & { chain?: 'btc' })
  | (SolBlock & { chain?: 'sol' })
)

export type BlockChartPoint = {
  label: string
  tx: number
  gasRatio?: number
  secondary?: number
}
