import { useMemo } from 'react'
import { useAccount, useBalance, useBlockNumber, useGasPrice } from 'wagmi'
import { formatEther, formatGwei } from 'viem'
import { formatBlockNumber, shortAddress } from '../utils/format'

type MetricCard = {
  label: string
  value: string
  hint: string
}

export function MetricsGrid() {
  const { address, chain } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 12_000 } })
  const { data: balance } = useBalance({ address, query: { enabled: Boolean(address) } })

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
    <section className="metrics-grid" aria-label="链上指标">
      {metricCards.map((metric) => (
        <article key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.hint}</small>
        </article>
      ))}
    </section>
  )
}
