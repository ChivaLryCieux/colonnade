import { BlockChart } from './BlockChart'
import { useRecentBlocks } from '../hooks/useRecentBlocks'
import { useBlockNumber } from 'wagmi'

export function BlockVisualization() {
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const blocks = useRecentBlocks(blockNumber)

  return (
    <section className="visual-section">
      <div className="section-heading">
        <p className="eyebrow">D3 Visualization</p>
        <h2>最近区块活跃度</h2>
      </div>
      <BlockChart blocks={blocks} />
      <div className="legend">
        <span>
          <i className="bar-key" />交易数
        </span>
        <span>
          <i className="line-key" />Gas 使用率
        </span>
      </div>
    </section>
  )
}
