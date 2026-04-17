import * as d3 from 'd3'

export function shortAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBlockNumber(blockNumber?: bigint) {
  return blockNumber ? d3.format(',')(Number(blockNumber)) : '同步中'
}
