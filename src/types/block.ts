export type BlockPoint = {
  number: bigint
  transactions: number
  gasUsed: bigint
  gasLimit: bigint
}

export type BlockChartPoint = {
  label: string
  tx: number
  gasRatio: number
}
