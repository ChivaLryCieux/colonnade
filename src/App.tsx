import { WalletConnect } from './components/WalletConnect'
import { MetricsGrid } from './components/MetricsGrid'
import { BlockVisualization } from './components/BlockVisualization'
import { BlockDetails } from './components/BlockDetails'
import './App.css'

function App() {
  return (
    <main>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Ethereum Mainnet Monitor</p>
          <h1>
            Colonnade DApp
            <span>以太坊链上数据可视化</span>
          </h1>
          <p className="lead">
            连接钱包，读取以太坊链上状态，并用 D3 展示最近区块的交易活跃度与 Gas 使用率。
          </p>
        </div>

        <WalletConnect />
      </section>

      <MetricsGrid />
      <BlockVisualization />
      <BlockDetails />
    </main>
  )
}

export default App
