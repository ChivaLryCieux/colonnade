import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, fallback, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import './index.css'
import App from './App.tsx'

// 优化的 QueryClient 配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6_000,
      gcTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: fallback([
      http('https://eth.llamarpc.com'),
      http('https://ethereum.publicnode.com'),
    ]),
    [sepolia.id]: http(),
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
