import { useState, memo, useCallback } from 'react'
import type { ChainType } from '../types/chain'
import { CHAIN_CONFIG } from '../constants/chains'

type ChainSelectorProps = {
  value: ChainType
  onChange: (chain: ChainType) => void
}

function ChainSelectorComponent({ value, onChange }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChainChange = useCallback(
    (chain: ChainType) => {
      onChange(chain)
      setIsOpen(false)
    },
    [onChange]
  )

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <div className="chain-selector">
      <button
        type="button"
        onClick={toggleDropdown}
        className="chain-button"
        aria-label={`Select chain: ${CHAIN_CONFIG[value].name}`}
      >
        <span
          className="chain-icon"
          style={{ backgroundColor: CHAIN_CONFIG[value].color }}
        >
          {CHAIN_CONFIG[value].symbol.charAt(0)}
        </span>
        <span className="chain-name">{CHAIN_CONFIG[value].name}</span>
        <span className="chain-arrow">{isOpen ? '↑' : '↓'}</span>
      </button>

      {isOpen && (
        <div className="chain-dropdown">
          {(Object.keys(CHAIN_CONFIG) as ChainType[]).map((chain) => (
            <button
              key={chain}
              type="button"
              onClick={() => handleChainChange(chain)}
              className={`chain-option ${value === chain ? 'active' : ''}`}
            >
              <span
                className="chain-icon"
                style={{ backgroundColor: CHAIN_CONFIG[chain].color }}
              >
                {CHAIN_CONFIG[chain].symbol.charAt(0)}
              </span>
              <span className="chain-name">{CHAIN_CONFIG[chain].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const ChainSelector = memo(ChainSelectorComponent)
