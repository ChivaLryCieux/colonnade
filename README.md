# Colonnade DApp

以太坊链上数据可视化 DApp。项目基于 Vite、React 和 TypeScript 构建，使用 Wagmi 与 Viem 接入以太坊网络，通过 RPC 查询实时链上数据，并使用 D3.js 将最近区块的交易活跃度和 Gas 使用率可视化。

## 功能概览

- 钱包连接：通过 Wagmi 连接浏览器注入的钱包，例如 MetaMask。
- 链上状态读取：获取当前以太坊最新区块号、Gas Price 和已连接钱包 ETH 余额。
- RPC 数据查询：通过 Viem public client 查询最近 12 个区块的交易数量、Gas Used 和 Gas Limit。
- 数据可视化：使用 D3.js 绘制交易数量柱状图和 Gas 使用率折线图。
- RPC fallback：主网 RPC 使用多个公共端点 fallback，避免单个公共 RPC 限流导致页面一直处于同步状态。
- 瑞士风格界面：黑白灰信息布局，红色作为关键状态强调，强调网格、秩序和数据可读性。

## 技术框架

### Vite + React + TypeScript

Vite 提供快速开发服务器和生产构建能力。React 负责组件化界面，TypeScript 提供类型约束，确保链上数据、钱包地址、BigInt 区块字段等数据结构更稳定。

### Wagmi

Wagmi 是 React 生态中常用的 Web3 Hooks 工具库。本项目使用它处理钱包状态和链上读取：

- `WagmiProvider`：为 React 应用提供 Web3 配置。
- `useConnect`：发起钱包连接。
- `useDisconnect`：断开钱包连接。
- `useAccount`：读取当前钱包地址、连接状态和链信息。
- `useBlockNumber`：订阅最新区块号。
- `useGasPrice`：读取当前 Gas Price。
- `useBalance`：读取已连接地址的 ETH 余额。
- `usePublicClient`：获取 Viem public client，用于自定义 RPC 查询。

### Viem

Viem 是底层以太坊 RPC 客户端。本项目通过 Wagmi 集成 Viem，并使用它完成链上数据读取和格式化：

- `publicClient.getBlock()`：按区块号读取区块详情。
- `formatEther()`：将 wei 格式余额转换为 ETH。
- `formatGwei()`：将 wei 格式 Gas Price 转换为 Gwei。

主网 RPC 配置在 `src/main.tsx`：

```ts
[mainnet.id]: fallback([
  http('https://eth.llamarpc.com'),
  http('https://ethereum.publicnode.com'),
]),
```

这避免了默认公共 RPC 被限流时导致 `useBlockNumber` 无法返回数据的问题。

### D3.js

D3.js 用于把链上区块数据转换为 SVG 图表。本项目没有把 D3 作为 DOM 操作器使用，而是使用它的比例尺和图形计算能力，再由 React 渲染 SVG：

- `scaleBand()`：计算区块柱状图的横向位置。
- `scaleLinear()`：计算交易数量和 Gas 使用率的纵向位置。
- `line()`：生成 Gas 使用率折线路径。
- `curveMonotoneX`：让折线保持平滑且单调。
- `format()`：格式化区块号显示。

## 链上数据流程

1. 应用启动后，`WagmiProvider` 初始化以太坊主网和 Sepolia 网络配置。
2. `useBlockNumber({ watch: true })` 持续获取最新区块号。
3. `useGasPrice()` 定时刷新当前 Gas Price。
4. 用户连接钱包后，`useAccount()` 获取地址，`useBalance()` 查询该地址 ETH 余额。
5. `usePublicClient()` 获取 Viem public client。
6. 应用基于最新区块号计算最近 12 个区块编号。
7. 通过 `publicClient.getBlock({ blockNumber })` 并发查询区块数据。
8. 将区块交易数与 Gas 使用率整理为图表数据。
9. D3 计算比例尺、柱状图高度和折线路径，React 渲染 SVG。

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
    BlockChart.tsx      区块活跃度图表（柱状 + 折线）
  hooks/
    useRecentBlocks.ts  最近区块查询与缓存刷新
  constants/
    mockBlocks.ts       RPC 不可用时的图表回退数据
  utils/
    format.ts           地址/区块号格式化工具
  types/
    block.ts            区块与图表数据类型
  App.tsx               页面组装、钱包交互、指标卡片
  App.css               页面布局和瑞士风格组件样式
  main.tsx              Wagmi、Viem transport、React Query 初始化
  index.css             全局设计变量、排版和基础样式
```

## 注意事项

- 浏览器需要安装支持 EIP-1193 的钱包扩展才能使用钱包连接功能。
- 公共 RPC 可能存在限流、延迟或不可用情况，生产环境建议配置自有 RPC 服务，例如 Alchemy、Infura、QuickNode 或自建节点。
- 当前图表展示最近 12 个区块，适合做实时状态监控。若需要历史趋势分析，可以扩展为分页查询、缓存或后端索引服务。
