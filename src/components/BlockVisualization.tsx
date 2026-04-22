import { BlockChart } from './BlockChart'
import { useRecentBlocks } from '../hooks/useRecentBlocks'
import type { ChainType } from '../types/chain'

type BlockVisualizationProps = {
  chain: ChainType
}

export function BlockVisualization({ chain }: BlockVisualizationProps) {
  const blocks = useRecentBlocks(chain)

  return (
    <section className="visual-section">
      <div className="section-heading">
        <p className="eyebrow">D3 Visualization</p>
        <h2>
          {chain === 'eth' && '以太坊最近区块交易数与 Gas 使用率'}
          {chain === 'btc' && '比特币最近区块交易数与区块大小'}
          {chain === 'sol' && 'Solana 最近区块交易数与 TPS'}
        </h2>
      </div>
      <BlockChart blocks={blocks} chain={chain} />
    </section>
  )
}
