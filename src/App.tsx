import { useMemo } from 'react'
import * as d3 from 'd3'
import { useQuery } from '@tanstack/react-query'
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useConnect,
  useDisconnect,
  useGasPrice,
  usePublicClient,
} from 'wagmi'
import { formatEther, formatGwei } from 'viem'
import './App.css'

type BlockPoint = {
  number: bigint
  transactions: number
  gasUsed: bigint
  gasLimit: bigint
}

const sampleBlocks: BlockPoint[] = [
  { number: 22190201n, transactions: 138, gasUsed: 16289044n, gasLimit: 30000000n },
  { number: 22190202n, transactions: 166, gasUsed: 18462180n, gasLimit: 30000000n },
  { number: 22190203n, transactions: 122, gasUsed: 14300411n, gasLimit: 30000000n },
  { number: 22190204n, transactions: 190, gasUsed: 20771309n, gasLimit: 30000000n },
  { number: 22190205n, transactions: 151, gasUsed: 17644012n, gasLimit: 30000000n },
  { number: 22190206n, transactions: 177, gasUsed: 19938022n, gasLimit: 30000000n },
  { number: 22190207n, transactions: 112, gasUsed: 12631880n, gasLimit: 30000000n },
  { number: 22190208n, transactions: 201, gasUsed: 23100930n, gasLimit: 30000000n },
  { number: 22190209n, transactions: 149, gasUsed: 16950100n, gasLimit: 30000000n },
  { number: 22190210n, transactions: 185, gasUsed: 21400720n, gasLimit: 30000000n },
  { number: 22190211n, transactions: 132, gasUsed: 15278120n, gasLimit: 30000000n },
  { number: 22190212n, transactions: 171, gasUsed: 19340552n, gasLimit: 30000000n },
]

function shortAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatBlockNumber(blockNumber?: bigint) {
  return blockNumber ? d3.format(',')(Number(blockNumber)) : '同步中'
}

function useRecentBlocks(latestBlock?: bigint) {
  const publicClient = usePublicClient()

  const query = useQuery({
    enabled: Boolean(latestBlock && publicClient),
    queryKey: ['recent-blocks', publicClient?.chain.id, latestBlock?.toString()],
    queryFn: async () => {
      if (!latestBlock || !publicClient) {
        return sampleBlocks
      }

      const count = 12n
      const firstBlock = latestBlock > count ? latestBlock - count + 1n : 1n
      const blockNumbers = Array.from(
        { length: Number(latestBlock - firstBlock + 1n) },
        (_, index) => firstBlock + BigInt(index),
      )
      const blocks = await Promise.all(
        blockNumbers.map((blockNumber) => publicClient.getBlock({ blockNumber })),
      )

      return blocks.map((block) => ({
        number: block.number,
        transactions: block.transactions.length,
        gasUsed: block.gasUsed,
        gasLimit: block.gasLimit,
      }))
    },
    refetchInterval: 24_000,
  })

  return useMemo(() => query.data ?? sampleBlocks, [query.data])
}

function BlockChart({ blocks }: { blocks: BlockPoint[] }) {
  const width = 760
  const height = 320
  const margin = { top: 22, right: 26, bottom: 42, left: 52 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const chartData = blocks.map((block) => ({
    label: `#${block.number.toString().slice(-4)}`,
    tx: block.transactions,
    gasRatio: Number(block.gasUsed) / Number(block.gasLimit || 1n),
  }))

  const x = d3
    .scaleBand()
    .domain(chartData.map((point) => point.label))
    .range([0, innerWidth])
    .padding(0.28)

  const txMax = d3.max(chartData, (point) => point.tx) ?? 1
  const yTx = d3.scaleLinear().domain([0, txMax]).nice().range([innerHeight, 0])
  const yGas = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

  const line = d3
    .line<(typeof chartData)[number]>()
    .x((point) => (x(point.label) ?? 0) + x.bandwidth() / 2)
    .y((point) => yGas(point.gasRatio))
    .curve(d3.curveMonotoneX)

  const yTicks = yTx.ticks(4)

  return (
    <svg className="block-chart" viewBox={`0 0 ${width} ${height}`} role="img">
      <title>以太坊最近区块交易数与 Gas 使用率</title>
      <g transform={`translate(${margin.left} ${margin.top})`}>
        {yTicks.map((tick) => (
          <g key={tick} transform={`translate(0 ${yTx(tick)})`}>
            <line className="grid-line" x2={innerWidth} />
            <text className="axis-label" x={-12} dy="0.32em" textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        {chartData.map((point) => {
          const barX = x(point.label) ?? 0
          const barHeight = innerHeight - yTx(point.tx)

          return (
            <g key={point.label}>
              <rect
                className="tx-bar"
                x={barX}
                y={yTx(point.tx)}
                width={x.bandwidth()}
                height={barHeight}
                rx="4"
              />
              <text
                className="x-label"
                x={barX + x.bandwidth() / 2}
                y={innerHeight + 24}
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          )
        })}

        <path className="gas-line" d={line(chartData) ?? undefined} />
        {chartData.map((point) => (
          <circle
            className="gas-dot"
            key={`${point.label}-gas`}
            cx={(x(point.label) ?? 0) + x.bandwidth() / 2}
            cy={yGas(point.gasRatio)}
            r="5"
          />
        ))}
      </g>
    </svg>
  )
}

function App() {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 12_000 } })
  const { data: balance } = useBalance({ address, query: { enabled: Boolean(address) } })
  const blocks = useRecentBlocks(blockNumber)

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
        <article>
          <span>最新区块</span>
          <strong>{formatBlockNumber(blockNumber)}</strong>
          <small>{chain?.name ?? 'Ethereum'}</small>
        </article>
        <article>
          <span>Gas Price</span>
          <strong>{gasPrice ? `${Number(formatGwei(gasPrice)).toFixed(2)} Gwei` : '同步中'}</strong>
          <small>实时链上读取</small>
        </article>
        <article>
          <span>钱包余额</span>
          <strong>{balance ? `${Number(formatEther(balance.value)).toFixed(4)} ETH` : '连接后显示'}</strong>
          <small>{address ? shortAddress(address) : 'Injected wallet'}</small>
        </article>
      </section>

      <section className="visual-section">
        <div className="section-heading">
          <p className="eyebrow">D3 Visualization</p>
          <h2>最近区块活跃度</h2>
        </div>
        <BlockChart blocks={blocks} />
        <div className="legend">
          <span><i className="bar-key" />交易数</span>
          <span><i className="line-key" />Gas 使用率</span>
        </div>
      </section>
    </main>
  )
}

export default App
