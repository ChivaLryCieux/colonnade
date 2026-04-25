# Colonnade DApp

多链数据查询 DApp。项目基于 Vite、React 和 TypeScript 构建，支持 Bitcoin、Ethereum、Solana 主网数据查询与可视化；默认进入 Bitcoin 页面，也可以通过链选择器切换网络。

## 功能概览

- 多链切换：支持 Bitcoin、Ethereum、Solana，首页和下拉首项默认为 BTC。
- 链上状态读取：展示当前网络的最新区块高度或 Slot、交易数量、网络状态等核心指标。
- 最近区块可视化：使用 D3.js 绘制最近 12 个区块的交易活跃度，并按链展示 Gas 使用率、区块大小或 TPS 辅助曲线。
- 区块详情：展示最新区块/Slot 的时间、哈希和交易快照。
- 钱包连接：Ethereum 页面支持通过 Wagmi 连接浏览器注入钱包，例如 MetaMask，并读取 ETH 余额。
- RPC fallback：Ethereum 主网 RPC 使用多个公共端点 fallback；Bitcoin 和 Solana 通过公共接口查询，并在接口不可用时保留回退数据。
- 数据优先界面：黑白灰信息布局，红色作为关键状态强调，强调网格、秩序和数据可读性。

## 技术栈

### Vite + React + TypeScript

Vite 提供开发服务器和生产构建能力。React 负责组件化界面，TypeScript 约束链类型、区块数据、交易数据和 BigInt 字段，降低多链数据结构差异带来的运行时风险。

### TanStack Query

用于管理非 Ethereum 链的数据刷新、缓存和失败重试。Bitcoin 与 Solana 最近区块数据通过查询缓存定时刷新，避免组件内重复请求逻辑。

### Wagmi + Viem

用于 Ethereum 钱包连接和 EVM 链上数据读取：

- `WagmiProvider`：提供 Web3 配置。
- `useConnect` / `useDisconnect`：连接和断开钱包。
- `useAccount`：读取钱包地址和连接状态。
- `useBlockNumber`：订阅 Ethereum 最新区块号。
- `useGasPrice`：读取当前 Gas Price。
- `useBalance`：读取已连接地址 ETH 余额。
- `useBlock`：读取 Ethereum 最新区块详情。
- `formatEther()` / `formatGwei()`：格式化 ETH 余额和 Gas Price。

Ethereum 主网 RPC 配置在 `src/main.tsx`：

```ts
[mainnet.id]: fallback([
  http('https://eth.llamarpc.com'),
  http('https://ethereum.publicnode.com'),
]),
```

### Bitcoin Public API

Bitcoin 页面通过 `blockchain.info` 公共接口读取最新区块高度与区块详情：

- `https://blockchain.info/q/getblockcount`
- `https://blockchain.info/block-height/{height}?format=json`
- `https://blockchain.info/rawblock/{hash}`

### Solana JSON RPC

Solana 页面通过主网 JSON RPC 查询最新 Slot 和区块详情：

- `getSlot`：读取最新 Slot。
- `getBlock`：读取指定 Slot 的区块数据。

Solana RPC 返回会先做结构校验，避免公共节点返回空结果或错误结构时导致页面白屏。

### D3.js

D3.js 用于把链上区块数据转换为 SVG 图表。本项目主要使用 D3 的比例尺和路径计算能力，再由 React 渲染 SVG：

- `scaleBand()`：计算区块柱状图的横向位置。
- `scaleLinear()`：计算交易数量、Gas 使用率、区块大小或 TPS 的纵向位置。
- `line()`：生成辅助指标折线路径。
- `curveMonotoneX`：让折线保持平滑。
- `format()`：格式化区块号显示。

## 链上数据流程

1. 应用启动后读取 `DEFAULT_CHAIN`，默认进入 Bitcoin 页面。
2. 用户通过链选择器切换 Bitcoin、Ethereum 或 Solana。
3. `MetricsGrid` 根据当前链读取最新高度、Slot、Gas Price 或钱包余额。
4. `useRecentBlocks` 获取最近 12 个区块的图表数据，并在接口不可用时使用 mock fallback。
5. `BlockChart` 使用 D3 计算柱状图和折线路径，React 渲染 SVG。
6. `BlockDetails` 查询最新区块详情并展示交易快照。
7. Ethereum 页面额外支持钱包连接与余额读取。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## 项目结构

```txt
src/
  components/
    BlockChart.tsx             多链区块活跃度图表
    BlockDetails.tsx           最新区块/Slot 详情
    ChainSelector.tsx          多链选择器
    MetricsGrid.tsx            多链指标卡片
    WalletConnect.tsx          Ethereum 钱包连接
  hooks/
    useRecentBlocks.ts         最近区块查询与缓存刷新
  constants/
    chains.ts                  链配置和默认链
    mockBlocks.ts              RPC 不可用时的图表回退数据
  utils/
    format.ts                  地址/区块号格式化工具
  types/
    chain.ts                   链配置和链专属区块字段类型
    block.ts                   区块与图表数据类型
  App.tsx                      页面组装和链切换
  App.css                      页面布局和组件样式
  main.tsx                     Wagmi、Viem transport、React Query 初始化
  index.css                    全局设计变量、排版和基础样式
```

## 注意事项

- Bitcoin 与 Solana 数据来自公共接口，可能存在限流、延迟或短暂不可用；生产环境建议配置稳定的自有 RPC 或 API 服务。
- Ethereum 钱包连接需要浏览器安装支持 EIP-1193 的钱包扩展。
- 当前图表展示最近 12 个区块，适合实时状态监控。若需要历史趋势分析，可以扩展为分页查询、缓存或后端索引服务。
