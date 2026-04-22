import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortAddress } from '../utils/format'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="wallet-panel">
      <div>
        <span className="panel-label">Web3 Wallet</span>
        <strong>{isConnected && address ? shortAddress(address) : '未连接'}</strong>
      </div>
      {isConnected ? (
        <button type="button" onClick={() => disconnect()}>
          断开连接
        </button>
      ) : (
        connectors.map((connector) => (
          <button
            type="button"
            disabled={isPending}
            key={connector.uid}
            onClick={() => connect({ connector })}
          >
            连接 {connector.name}
          </button>
        ))
      )}
    </div>
  )
}
