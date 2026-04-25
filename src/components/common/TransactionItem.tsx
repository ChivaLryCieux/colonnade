import { memo } from 'react'
import { formatEther } from 'viem'
import { shortAddress } from '../../utils/format'

type TransactionItemProps = {
  index: number
  hash: string
  to: string | null
  value: bigint
}

function shortIdentifier(value: string) {
  if (value.startsWith('0x')) {
    return shortAddress(value as `0x${string}`)
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function TransactionItemComponent({ index, hash, to, value }: TransactionItemProps) {
  return (
    <li>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <code>{hash}</code>
      <strong>{to ? shortIdentifier(to) : 'Contract Creation'}</strong>
      <em>{Number(formatEther(value)).toFixed(5)} ETH</em>
    </li>
  )
}

export const TransactionItem = memo(TransactionItemComponent)
