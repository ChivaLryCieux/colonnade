import type { BlockPoint } from '../types/block'
import { SAMPLE_BLOCKS } from '../constants/mockBlocks'

const RECENT_BLOCK_COUNT = 12n

export async function fetchRecentBlocks(
  latestBlock: bigint,
  getBlock: (params: { blockNumber: bigint }) => Promise<any>,
): Promise<BlockPoint[]> {
  const firstBlock = latestBlock > RECENT_BLOCK_COUNT ? latestBlock - RECENT_BLOCK_COUNT + 1n : 1n
  const blockNumbers = Array.from(
    { length: Number(latestBlock - firstBlock + 1n) },
    (_, index) => firstBlock + BigInt(index),
  )

  // 使用分批请求避免并发过多
  const batchSize = 4
  const blocks: any[] = []

  for (let i = 0; i < blockNumbers.length; i += batchSize) {
    const batch = blockNumbers.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((blockNumber) => getBlock({ blockNumber })),
    )
    blocks.push(...batchResults)
  }

  return blocks.map((block) => ({
    number: block.number,
    transactions: block.transactions.length,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
  }))
}

export function getBlocksWithFallback(
  data: BlockPoint[] | undefined,
  isEnabled: boolean,
): BlockPoint[] {
  if (!isEnabled) {
    return SAMPLE_BLOCKS
  }
  return data ?? SAMPLE_BLOCKS
}
