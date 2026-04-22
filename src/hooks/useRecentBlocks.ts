import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { SAMPLE_BLOCKS } from '../constants/mockBlocks'
import { fetchRecentBlocks, getBlocksWithFallback } from '../services/blockService'
import type { BlockPoint } from '../types/block'

const REFRESH_INTERVAL_MS = 24_000

export function useRecentBlocks(latestBlock?: bigint) {
  const publicClient = usePublicClient()
  const isEnabled = Boolean(latestBlock && publicClient)

  const query = useQuery<BlockPoint[]>({
    enabled: isEnabled,
    queryKey: ['recent-blocks', publicClient?.chain.id, latestBlock?.toString()],
    queryFn: async () => {
      if (!latestBlock || !publicClient) {
        return SAMPLE_BLOCKS
      }
      return fetchRecentBlocks(latestBlock, publicClient.getBlock.bind(publicClient))
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    // 性能优化配置
    staleTime: 12_000,
    gcTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return useMemo(
    () => getBlocksWithFallback(query.data, isEnabled),
    [query.data, isEnabled],
  )
}
