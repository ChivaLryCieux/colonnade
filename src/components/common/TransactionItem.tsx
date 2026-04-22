import { memo } from 'react'
import { formatEther } from 'viem'
import { shortAddress } from '../../utils/format'

type TransactionItemProps = {
  index: number
  hash: `0x${string}`
  to: `0x${string}` | null
  value: bigint
}

function TransactionItemComponent({ index, hash, to, value }: TransactionItemProps) {
  return (
    <li>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <code>{hash}</code>
      <strong>{to ? shortAddress(to) : 'Contract Creation'}</strong>
      <em>{Number(formatEther(value)).toFixed(5)} ETH</em>
    </li>
  )
}

export const TransactionItem = memo(TransactionItemComponent)
