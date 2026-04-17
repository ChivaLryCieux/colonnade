import { useMemo } from 'react'
import { useAccount, useBalance, useBlock, useBlockNumber, useConnect, useDisconnect, useGasPrice } from 'wagmi'
import { formatEther, formatGwei } from 'viem'
import { BlockChart } from './components/BlockChart'
import { useRecentBlocks } from './hooks/useRecentBlocks'
import { formatBlockNumber, shortAddress } from './utils/format'
import './App.css'

type MetricCard = {
  label: string
  value: string
  hint: string
}

function formatBlockTimestamp(timestamp?: bigint) {
  if (!timestamp) {
    return '同步中'
  }

  return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN', {
    hour12: false,
    timeZoneName: 'short',
  })
}

function App() {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 12_000 } })
  const { data: balance } = useBalance({ address, query: { enabled: Boolean(address) } })
  const { data: latestBlock, isLoading: isBlockLoading } = useBlock({
    blockTag: 'latest',
    includeTransactions: true,
    watch: true,
    query: {
      refetchInterval: 12_000,
    },
  })
  const blocks = useRecentBlocks(blockNumber)

  const metricCards = useMemo<MetricCard[]>(
    () => [
      {
        label: '最新区块',
        value: formatBlockNumber(blockNumber),
        hint: chain?.name ?? 'Ethereum',
      },
      {
        label: 'Gas Price',
        value: gasPrice ? `${Number(formatGwei(gasPrice)).toFixed(2)} Gwei` : '同步中',
        hint: '实时链上读取',
      },
      {
        label: '钱包余额',
        value: balance ? `${Number(formatEther(balance.value)).toFixed(4)} ETH` : '连接后显示',
        hint: address ? shortAddress(address) : 'Injected wallet',
      },
    ],
    [address, balance, blockNumber, chain?.name, gasPrice],
  )

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
    <main>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Ethereum Mainnet Monitor</p>
          <h1>
            Colonnade DApp
            <span>以太坊链上数据可视化</span>
          </h1>
          <p className="lead">
            连接钱包，读取以太坊链上状态，并用 D3 展示最近区块的交易活跃度与 Gas 使用率。
          </p>
        </div>

        <div className="wallet-panel">
          <div>
            <span className="panel-label">Web3 Wallet</span>
            <strong>{isConnected && address ? shortAddress(address) : '未连接'}</strong>
          </div>
          {isConnected ? (
            <button type="button" onClick={() => disconnect()}>
              断开连接
            </button>
          ) : (
            connectors.map((connector) => (
              <button
                type="button"
                disabled={isPending}
                key={connector.uid}
                onClick={() => connect({ connector })}
              >
                连接 {connector.name}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="metrics-grid" aria-label="链上指标">
        {metricCards.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.hint}</small>
          </article>
        ))}
      </section>

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
              <li key={tx.hash}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <code>{tx.hash}</code>
                <strong>{tx.to ? shortAddress(tx.to) : 'Contract Creation'}</strong>
                <em>{Number(formatEther(tx.value)).toFixed(5)} ETH</em>
              </li>
            ))}
          </ol>
          {transactions.length === 0 && <p className="empty-note">当前区块暂无交易或仍在同步中。</p>}
        </div>
      </section>
    </main>
  )
}

export default App
