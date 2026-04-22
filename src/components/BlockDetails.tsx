import { useMemo } from 'react'
import { useBlock } from 'wagmi'
import { formatBlockNumber } from '../utils/format'
import { TransactionItem } from './common/TransactionItem'

function formatBlockTimestamp(timestamp?: bigint) {
  if (!timestamp) {
    return '同步中'
  }

  return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN', {
    hour12: false,
    timeZoneName: 'short',
  })
}

export function BlockDetails() {
  const { data: latestBlock, isLoading: isBlockLoading } = useBlock({
    blockTag: 'latest',
    includeTransactions: true,
    watch: true,
    query: {
      refetchInterval: 12_000,
    },
  })

  const transactions = useMemo(() => {
    if (!latestBlock || latestBlock.transactions.length === 0) {
      return [] as Array<{ hash: `0x${string}`; to: `0x${string}` | null; value: bigint }>
    }

    const normalized: Array<{ hash: `0x${string}`; to: `0x${string}` | null; value: bigint }> = []

    for (const tx of latestBlock.transactions) {
      if (typeof tx === 'string') {
        normalized.push({ hash: tx, to: null, value: 0n })
      } else {
        normalized.push({ hash: tx.hash, to: tx.to, value: tx.value })
      }
    }

    return normalized
  }, [latestBlock])

  return (
    <section className="block-details" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">useBlock Deep Dive</p>
        <h2>最新区块详情</h2>
      </div>

      <div className="details-grid">
        <article>
          <span>区块高度</span>
          <strong>{latestBlock?.number ? formatBlockNumber(latestBlock.number) : '同步中'}</strong>
          <small>实时 latest blockTag</small>
        </article>
        <article>
          <span>区块时间</span>
          <strong>{formatBlockTimestamp(latestBlock?.timestamp)}</strong>
          <small>链上 Unix Timestamp</small>
        </article>
        <article>
          <span>交易数量</span>
          <strong>{latestBlock?.transactions.length ?? 0}</strong>
          <small>includeTransactions: true</small>
        </article>
      </div>

      <div className="hash-panel">
        <p className="panel-label">Block Hash</p>
        <code>{latestBlock?.hash ?? (isBlockLoading ? '加载中...' : '暂无数据')}</code>
      </div>

      <div className="tx-list-panel">
        <div className="tx-list-heading">
          <p className="panel-label">Transactions Snapshot</p>
          <small>展示前 10 条，观察链上实际存储的交易哈希、接收方与转账值</small>
        </div>
        <ol>
          {transactions.slice(0, 10).map((tx, index) => (
            <TransactionItem
              key={tx.hash}
              index={index}
              hash={tx.hash}
              to={tx.to}
              value={tx.value}
            />
          ))}
        </ol>
        {transactions.length === 0 && <p className="empty-note">当前区块暂无交易或仍在同步中。</p>}
      </div>
    </section>
  )
}
