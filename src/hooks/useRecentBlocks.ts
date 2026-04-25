import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBlock, useBlockNumber } from 'wagmi'
import { getMockBlocks } from '../constants/mockBlocks'
import type { ChainType, BlockPoint } from '../types/block'

const RECENT_BLOCK_COUNT = 12
const REFRESH_INTERVAL_MS = 24000

export function useRecentBlocks(chain: ChainType): BlockPoint[] {
  const { data: blockNumber } = useBlockNumber({ watch: chain === 'eth' })
  const { data: latestBlock } = useBlock({
    blockTag: 'latest',
    watch: chain === 'eth',
    query: { refetchInterval: REFRESH_INTERVAL_MS },
  })

  const queryFn = useMemo(() => async (): Promise<BlockPoint[]> => {
    if (chain === 'btc') {
      try {
        const response = await fetch('https://blockchain.info/q/getblockcount')
        const height = await response.text()
        const blocks: BlockPoint[] = []
        const startHeight = Math.max(Number(height) - RECENT_BLOCK_COUNT + 1, 1)

        for (let i = 0; i < RECENT_BLOCK_COUNT; i++) {
          blocks.push({
            number: BigInt(startHeight + i),
            transactions: Math.floor(100 + Math.random() * 100),
            size: Math.floor(1000000 + Math.random() * 500000),
            weight: Math.floor(3500000 + Math.random() * 1000000),
          })
        }
        return blocks
      } catch {
        return getMockBlocks('btc', RECENT_BLOCK_COUNT)
      }
    }

    if (chain === 'sol') {
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
        const slot = data.result || 250000000
        const blocks: BlockPoint[] = []

        for (let i = 0; i < RECENT_BLOCK_COUNT; i++) {
          blocks.push({
            number: BigInt(slot - RECENT_BLOCK_COUNT + i + 1),
            transactions: Math.floor(600 + Math.random() * 500),
            slot: BigInt(slot - RECENT_BLOCK_COUNT + i + 1),
            leader: `validator${(i + 1).toString()}`,
          })
        }
        return blocks
      } catch {
        return getMockBlocks('sol', RECENT_BLOCK_COUNT)
      }
    }

    return getMockBlocks('eth', RECENT_BLOCK_COUNT)
  }, [chain])

  const { data: nonEthBlocks } = useQuery({
    enabled: chain !== 'eth',
    queryKey: ['recent-blocks', chain],
    queryFn,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 12000,
    gcTime: 60000,
    retry: 2,
    refetchOnWindowFocus: false,
  })

  const ethBlocks = useMemo(() => {
    if (chain !== 'eth') return null
    if (!blockNumber || !latestBlock) return null

    const blocks: BlockPoint[] = []
    const startNumber = blockNumber > BigInt(RECENT_BLOCK_COUNT)
      ? blockNumber - BigInt(RECENT_BLOCK_COUNT) + 1n
      : 1n

    for (let i = 0; i < RECENT_BLOCK_COUNT; i++) {
      // 为每个区块生成随机的 gasUsed 值，模拟真实的 gas 使用变化
      const randomGasFactor = 0.6 + Math.random() * 0.8 // 0.6 到 1.4 之间的随机因子
      const gasUsed = BigInt(Math.floor(Number(latestBlock.gasUsed) * randomGasFactor))

      blocks.push({
        number: startNumber + BigInt(i),
        transactions: Math.floor(latestBlock.transactions.length * (0.8 + Math.random() * 0.4)),
        gasUsed: gasUsed,
        gasLimit: latestBlock.gasLimit,
      })
    }
    return blocks
  }, [chain, blockNumber, latestBlock])

  return useMemo(() => {
    if (chain === 'eth' && ethBlocks) {
      return ethBlocks
    }
    if (chain !== 'eth' && nonEthBlocks) {
      return nonEthBlocks
    }
    return getMockBlocks(chain, RECENT_BLOCK_COUNT)
  }, [chain, ethBlocks, nonEthBlocks])
}
