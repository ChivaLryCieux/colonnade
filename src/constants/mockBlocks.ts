import type { BlockPoint, ChainType } from '../types/block'

export const SAMPLE_BLOCKS: BlockPoint[] = [
  {
    number: 22190201n,
    transactions: 138,
    gasUsed: 16289044n,
    gasLimit: 30000000n,
  },
  {
    number: 22190202n,
    transactions: 166,
    gasUsed: 18462180n,
    gasLimit: 30000000n,
  },
  {
    number: 22190203n,
    transactions: 122,
    gasUsed: 14300411n,
    gasLimit: 30000000n,
  },
  {
    number: 22190204n,
    transactions: 190,
    gasUsed: 20771309n,
    gasLimit: 30000000n,
  },
  {
    number: 22190205n,
    transactions: 151,
    gasUsed: 17644012n,
    gasLimit: 30000000n,
  },
  {
    number: 22190206n,
    transactions: 177,
    gasUsed: 19938022n,
    gasLimit: 30000000n,
  },
  {
    number: 22190207n,
    transactions: 112,
    gasUsed: 12631880n,
    gasLimit: 30000000n,
  },
  {
    number: 22190208n,
    transactions: 201,
    gasUsed: 23100930n,
    gasLimit: 30000000n,
  },
  {
    number: 22190209n,
    transactions: 149,
    gasUsed: 16950100n,
    gasLimit: 30000000n,
  },
  {
    number: 22190210n,
    transactions: 185,
    gasUsed: 21400720n,
    gasLimit: 30000000n,
  },
  {
    number: 22190211n,
    transactions: 132,
    gasUsed: 15278120n,
    gasLimit: 30000000n,
  },
  {
    number: 22190212n,
    transactions: 171,
    gasUsed: 19340552n,
    gasLimit: 30000000n,
  },
]

export function getMockBlocks(chain: ChainType, count: number): BlockPoint[] {
  const blocks: BlockPoint[] = []

  switch (chain) {
    case 'btc':
      for (let i = 0; i < count; i++) {
        blocks.push({
          number: 820000n - BigInt(count - i - 1),
          transactions: Math.floor(120 + Math.random() * 80),
          difficulty: BigInt(Math.floor(Math.random() * 30000000000000 + 10000000000000)),
          size: Math.floor(1000000 + Math.random() * 500000),
          weight: Math.floor(3500000 + Math.random() * 1000000),
        })
      }
      break

    case 'sol':
      for (let i = 0; i < count; i++) {
        blocks.push({
          number: 250000000n - BigInt(count - i - 1),
          transactions: Math.floor(700 + Math.random() * 400),
          slot: 250000000n - BigInt(count - i - 1),
          leader: `leader${(250000000 + i).toString()}`,
        })
      }
      break

    default:
      for (let i = 0; i < count; i++) {
        const blockNum = 22190212n - BigInt(count - i - 1)
        const txCount = Math.floor(100 + Math.random() * 100)
        const gasLimit = 30000000n
        const gasUsed = BigInt(Math.floor(txCount * 150000 + Math.random() * 5000000))

        blocks.push({
          number: blockNum,
          transactions: txCount,
          gasUsed,
          gasLimit,
        })
      }
  }

  return blocks
}
