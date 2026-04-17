import { useMemo } from 'react'
import { useAccount, useBalance, useBlockNumber, useConnect, useDisconnect, useGasPrice } from 'wagmi'
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

function App() {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 12_000 } })
  const { data: balance } = useBalance({ address, query: { enabled: Boolean(address) } })
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
    </main>
  )
}

export default App
