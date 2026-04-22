import { useMemo, useState, useEffect } from 'react'
import { useAccount, useBalance, useBlockNumber, useGasPrice } from 'wagmi'
import { formatEther, formatGwei } from 'viem'
import { formatBlockNumber, shortAddress } from '../utils/format'
import type { ChainType } from '../types/chain'
import { CHAIN_CONFIG } from '../constants/chains'

type MetricCard = {
  label: string
  value: string
  hint: string
}

type MetricsGridProps = {
  chain: ChainType
}

export function MetricsGrid({ chain }: MetricsGridProps) {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: chain === 'eth' })
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 12000, enabled: chain === 'eth' } })
  const { data: balance } = useBalance({ address, query: { enabled: chain === 'eth' && Boolean(address) } })

  const [btcMetrics, setBtcMetrics] = useState({ height: '820000', txCount: 150 })
  const [solMetrics, setSolMetrics] = useState({ slot: '250000000', txCount: 900 })

  useEffect(() => {
    if (chain === 'btc') {
      const fetchBtcMetrics = async () => {
        try {
          const response = await fetch('https://blockchain.info/q/getblockcount')
          const height = await response.text()
          setBtcMetrics(prev => ({ ...prev, height }))
        } catch {
        }
      }
      fetchBtcMetrics()
      const interval = setInterval(fetchBtcMetrics, 24000)
      return () => clearInterval(interval)
    }

    if (chain === 'sol') {
      const fetchSolMetrics = async () => {
        try {
          const response = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getSlot',
            }),
          })
          const data = await response.json()
          setSolMetrics(prev => ({ ...prev, slot: data.result.toString() }))
        } catch {
        }
      }
      fetchSolMetrics()
      const interval = setInterval(fetchSolMetrics, 24000)
      return () => clearInterval(interval)
    }
  }, [chain])

  const metricCards = useMemo<MetricCard[]>(() => {
    switch (chain) {
      case 'btc':
        return [
          {
            label: '最新区块高度',
            value: formatBlockNumber(BigInt(btcMetrics.height)),
            hint: 'Bitcoin Mainnet',
          },
          {
            label: '平均交易数',
            value: btcMetrics.txCount.toString(),
            hint: '每区块',
          },
          {
            label: '网络',
            value: 'Bitcoin',
            hint: '主网',
          },
        ]

      case 'sol':
        return [
          {
            label: '最新 Slot',
            value: formatBlockNumber(BigInt(solMetrics.slot)),
            hint: 'Solana Mainnet',
          },
          {
            label: '平均交易数',
            value: solMetrics.txCount.toString(),
            hint: '每区块',
          },
          {
            label: '网络',
            value: 'Solana',
            hint: '主网',
          },
        ]

      default:
        return [
          {
            label: '最新区块',
            value: formatBlockNumber(blockNumber),
            hint: CHAIN_CONFIG.eth.name || 'Ethereum',
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
        ]
    }
  }, [chain, blockNumber, gasPrice, balance, address, btcMetrics, solMetrics])

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
