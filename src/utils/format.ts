import * as d3 from 'd3'

// 缓存格式化结果
const shortAddressCache = new Map<string, string>()

export function shortAddress(address: `0x${string}`) {
  if (shortAddressCache.has(address)) {
    return shortAddressCache.get(address)!
  }
  const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`
  shortAddressCache.set(address, formatted)
  // 限制缓存大小
  if (shortAddressCache.size > 100) {
    const firstKey = Array.from(shortAddressCache.keys())[0]
    if (firstKey) {
      shortAddressCache.delete(firstKey)
    }
  }
  return formatted
}

// 缓存区块号格式化
const blockNumberCache = new Map<string, string>()

export function formatBlockNumber(blockNumber?: bigint) {
  if (!blockNumber) return '同步中'
  const key = blockNumber.toString()
  if (blockNumberCache.has(key)) {
    return blockNumberCache.get(key)!
  }
  const formatted = d3.format(',')(Number(blockNumber))
  blockNumberCache.set(key, formatted)
  if (blockNumberCache.size > 50) {
    const firstKey = Array.from(blockNumberCache.keys())[0]
    if (firstKey) {
      blockNumberCache.delete(firstKey)
    }
  }
  return formatted
}
