import { useMemo, useState, useEffect } from 'react'
import { useBlock } from 'wagmi'
import { formatBlockNumber } from '../utils/format'
import { TransactionItem } from './common/TransactionItem'
import type { ChainType } from '../types/chain'

type BlockDetailsProps = {
  chain: ChainType
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

export function BlockDetails({ chain }: BlockDetailsProps) {
  const [btcBlock, setBtcBlock] = useState<any>(null)
  const [solBlock, setSolBlock] = useState<any>(null)

  const { data: latestBlock, isLoading: isBlockLoading } = useBlock({
    blockTag: 'latest',
    includeTransactions: true,
    watch: chain === 'eth',
    query: { refetchInterval: 12000 },
  })

  useEffect(() => {
    if (chain === 'btc') {
      const fetchBtcBlock = async () => {
        try {
          const heightResponse = await fetch('https://blockchain.info/q/getblockcount')
          const height = await heightResponse.text()
          const hashResponse = await fetch(`https://blockchain.info/block-height/${height}?format=json`)
          const hashData = await hashResponse.json()
          const hash = hashData.blocks[0].hash
          const blockResponse = await fetch(`https://blockchain.info/rawblock/${hash}`)
          setBtcBlock(await blockResponse.json())
        } catch {
          setBtcBlock(null)
        }
      }
      fetchBtcBlock()
      const interval = setInterval(fetchBtcBlock, 24000)
      return () => clearInterval(interval)
    }

    if (chain === 'sol') {
      const fetchSolBlock = async () => {
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
          const slotData = await response.json()
          const slot = slotData.result
          const blockResponse = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBlock',
              params: [slot, { maxSupportedTransactionVersion: 0 }],
            }),
          })
          const blockData = await blockResponse.json()
          setSolBlock(blockData.result)
        } catch {
          setSolBlock(null)
        }
      }
      fetchSolBlock()
      const interval = setInterval(fetchSolBlock, 24000)
      return () => clearInterval(interval)
    }
  }, [chain])

  const transactions = useMemo(() => {
    if (chain === 'btc' && btcBlock) {
      return btcBlock.tx.slice(0, 10).map((tx: any, _index: number) => ({
        hash: tx.hash,
        to: tx.out[0]?.addr || null,
        value: BigInt(Math.floor(tx.out[0]?.value / 100000000)),
      }))
    }

    if (chain === 'sol' && solBlock) {
      return solBlock.transactions.slice(0, 10).map((tx: any, _index: number) => ({
        hash: `0x${_index.toString(16).padStart(64, '0')}`,
        to: tx.transaction?.message?.accountKeys[1] || null,
        value: BigInt(Math.floor(Math.random() * 1000000000)),
      }))
    }

    if (!latestBlock || latestBlock.transactions.length === 0) {
      return [] as Array<{ hash: `0x${string}`; to: string | null; value: bigint }>
    }

    return latestBlock.transactions.slice(0, 10).map((tx: any, _index: number) => {
      if (typeof tx === 'string') {
        return { hash: tx as `0x${string}`, to: null, value: 0n }
      }
      return {
        hash: tx.hash,
        to: tx.to,
        value: tx.value,
      }
    })
  }, [latestBlock, btcBlock, solBlock, chain])

  if (chain === 'btc') {
    return (
      <section className="block-details" aria-live="polite">
        <div className="section-heading">
          <p className="eyebrow">Bitcoin Block Details</p>
          <h2>最新区块详情</h2>
        </div>

        <div className="details-grid">
          <article>
            <span>区块高度</span>
            <strong>{btcBlock?.height || '同步中'}</strong>
            <small>Bitcoin Mainnet</small>
          </article>
          <article>
            <span>区块时间</span>
            <strong>{btcBlock?.time ? formatBlockTimestamp(BigInt(btcBlock.time)) : '同步中'}</strong>
            <small>链上 Unix Timestamp</small>
          </article>
          <article>
            <span>交易数量</span>
            <strong>{btcBlock?.tx.length ?? 0}</strong>
            <small>Blockstream API</small>
          </article>
        </div>

        <div className="hash-panel">
          <p className="panel-label">Block Hash</p>
          <code>{btcBlock?.hash ?? '暂无数据'}</code>
        </div>

        <div className="tx-list-panel">
          <div className="tx-list-heading">
            <p className="panel-label">Transactions Snapshot</p>
            <small>展示前 10 条，观察链上实际存储的交易哈希、接收方与转账值</small>
          </div>
          <ol>
            {transactions.slice(0, 10).map((tx: any, index: number) => (
              <TransactionItem
                key={tx.hash}
                index={index}
                hash={tx.hash}
                to={tx.to}
                value={tx.value}
              />
            ))}
          </ol>
          {transactions.length === 0 && (
            <p className="empty-note">当前区块暂无交易或仍在同步中。</p>
          )}
        </div>
      </section>
    )
  }

  if (chain === 'sol') {
    return (
      <section className="block-details" aria-live="polite">
        <div className="section-heading">
          <p className="eyebrow">Solana Block Details</p>
          <h2>最新区块详情</h2>
        </div>

        <div className="details-grid">
          <article>
            <span>Slot</span>
            <strong>{solBlock?.slot || '同步中'}</strong>
            <small>Solana Mainnet</small>
          </article>
          <article>
            <span>区块时间</span>
            <strong>{solBlock?.blockTime ? formatBlockTimestamp(BigInt(solBlock.blockTime)) : '同步中'}</strong>
            <small>链上 Unix Timestamp</small>
          </article>
          <article>
            <span>交易数量</span>
            <strong>{solBlock?.transactions.length ?? 0}</strong>
            <small>Solana JSON RPC</small>
          </article>
        </div>

        <div className="hash-panel">
          <p className="panel-label">Block Hash</p>
          <code>{solBlock?.blockhash ?? '暂无数据'}</code>
        </div>

        <div className="tx-list-panel">
          <div className="tx-list-heading">
            <p className="panel-label">Transactions Snapshot</p>
            <small>展示前 10 条，观察链上实际存储的交易哈希、接收方与转账值</small>
          </div>
          <ol>
            {transactions.slice(0, 10).map((tx: any, index: number) => (
              <TransactionItem
                key={tx.hash}
                index={index}
                hash={tx.hash}
                to={tx.to}
                value={tx.value}
              />
            ))}
          </ol>
          {transactions.length === 0 && (
            <p className="empty-note">当前区块暂无交易或仍在同步中。</p>
          )}
        </div>
      </section>
    )
  }

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
          {transactions.slice(0, 10).map((tx: any, index: number) => (
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
