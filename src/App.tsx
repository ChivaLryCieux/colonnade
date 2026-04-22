import { useState, useCallback, memo } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { ChainSelector } from './components/ChainSelector'
import { MetricsGrid } from './components/MetricsGrid'
import { BlockVisualization } from './components/BlockVisualization'
import { BlockDetails } from './components/BlockDetails'
import type { ChainType } from './types/chain'
import { DEFAULT_CHAIN } from './constants/chains'
import './App.css'

function AppComponent() {
  const [selectedChain, setSelectedChain] = useState<ChainType>(DEFAULT_CHAIN)

  const handleChainChange = useCallback((chain: ChainType) => {
    setSelectedChain(chain)
  }, [])

  return (
    <main>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">
            {selectedChain === 'eth' && 'Ethereum Mainnet Monitor'}
            {selectedChain === 'btc' && 'Bitcoin Mainnet Monitor'}
            {selectedChain === 'sol' && 'Solana Mainnet Monitor'}
          </p>
          <h1>
            Colonnade DApp
            <span>
              {selectedChain === 'eth' && '以太坊链上数据可视化'}
              {selectedChain === 'btc' && '比特币链上数据可视化'}
              {selectedChain === 'sol' && 'Solana链上数据可视化'}
            </span>
          </h1>
          <p className="lead">
            {selectedChain === 'eth' &&
              '连接钱包，读取以太坊链上状态，并用 D3 展示最近区块的交易活跃度与 Gas 使用率。'}
            {selectedChain === 'btc' &&
              '实时监控比特币网络状态，可视化区块数据和交易活跃度。'}
            {selectedChain === 'sol' &&
              '监控 Solana 网络性能，可视化区块处理和交易速度。'}
          </p>
          <ChainSelector value={selectedChain} onChange={handleChainChange} />
        </div>

        {selectedChain === 'eth' && <WalletConnect />}
        {selectedChain !== 'eth' && (
          <div className="wallet-panel">
            <div>
              <span className="panel-label">网络信息</span>
              <strong>
                {selectedChain === 'btc' && 'Bitcoin Mainnet'}
                {selectedChain === 'sol' && 'Solana Mainnet'}
              </strong>
            </div>
            <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                无需连接钱包即可查看{selectedChain === 'btc' ? '比特币' : 'Solana'}链数据
              </p>
            </div>
          </div>
        )}
      </section>

      <MetricsGrid chain={selectedChain} />
      <BlockVisualization chain={selectedChain} />
      <BlockDetails chain={selectedChain} />
    </main>
  )
}

export default memo(AppComponent)
