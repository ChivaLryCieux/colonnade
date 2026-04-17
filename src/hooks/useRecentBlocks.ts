import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { SAMPLE_BLOCKS } from '../constants/mockBlocks'
import type { BlockPoint } from '../types/block'

const RECENT_BLOCK_COUNT = 12n
const REFRESH_INTERVAL_MS = 24_000

export function useRecentBlocks(latestBlock?: bigint) {
  const publicClient = usePublicClient()

  const query = useQuery<BlockPoint[]>({
    enabled: Boolean(latestBlock && publicClient),
    queryKey: ['recent-blocks', publicClient?.chain.id, latestBlock?.toString()],
    queryFn: async () => {
      if (!latestBlock || !publicClient) {
        return SAMPLE_BLOCKS
      }

      const firstBlock = latestBlock > RECENT_BLOCK_COUNT ? latestBlock - RECENT_BLOCK_COUNT + 1n : 1n
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
    refetchInterval: REFRESH_INTERVAL_MS,
  })

  return useMemo(() => query.data ?? SAMPLE_BLOCKS, [query.data])
}
