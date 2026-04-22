import { useMemo, memo } from 'react'
import * as d3 from 'd3'
import type { BlockChartPoint, BlockPoint, ChainType } from '../types/block'

type BlockChartProps = {
  blocks: BlockPoint[]
  chain: ChainType
}

const CHART_SIZE = {
  width: 760,
  height: 320,
}

const CHART_MARGIN = {
  top: 22,
  right: 26,
  bottom: 42,
  left: 52,
}

function toChartData(blocks: BlockPoint[], chain: ChainType): BlockChartPoint[] {
  return blocks.map((block) => {
    let gasRatio: number | undefined
    let secondary: number | undefined

    if (chain === 'eth') {
      const gasLimit = (block as any).gasLimit
      const gasUsed = (block as any).gasUsed
      gasRatio = gasLimit && gasUsed ? Number(gasUsed) / Number(gasLimit) : 0
    } else if (chain === 'btc') {
      const size = (block as any).size
      secondary = size ? size / 1000 : 0
    } else if (chain === 'sol') {
      secondary = block.transactions / 10
    }

    return {
      label: `#${block.number.toString().slice(-4)}`,
      tx: block.transactions,
      gasRatio,
      secondary,
    }
  })
}

function BlockChartComponent({ blocks, chain }: BlockChartProps) {
  const innerWidth = CHART_SIZE.width - CHART_MARGIN.left - CHART_MARGIN.right
  const innerHeight = CHART_SIZE.height - CHART_MARGIN.top - CHART_MARGIN.bottom

  const { chartData, xScale, yTxScale, yTicks, linePath } = useMemo(() => {
    const chartData = toChartData(blocks, chain)

    const xScale = d3
      .scaleBand<string>()
      .domain(chartData.map((point) => point.label))
      .range([0, innerWidth])
      .padding(0.28)

    const txMax = d3.max(chartData, (point) => point.tx) || 1
    const yTxScale = d3
      .scaleLinear()
      .domain([0, txMax * 1.1])
      .nice()
      .range([innerHeight, 0])

    let linePath: string | undefined

    if (chain === 'eth' && chartData.every((d) => d.gasRatio !== undefined)) {
      const yGasScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])
      const lineBuilder = d3
        .line<BlockChartPoint>()
        .x((point) => (xScale(point.label) || 0) + xScale.bandwidth() / 2)
        .y((point) => yGasScale(point.gasRatio || 0))
        .curve(d3.curveMonotoneX)
      linePath = lineBuilder(chartData) as string | undefined
    } else if (
      (chain === 'btc' || chain === 'sol') &&
      chartData.every((d) => d.secondary !== undefined)
    ) {
      const secondaryMax = d3.max(chartData, (point) => point.secondary) || 1
      const ySecondaryScale = d3
        .scaleLinear()
        .domain([0, secondaryMax * 1.1])
        .nice()
        .range([innerHeight, 0])
      const lineBuilder = d3
        .line<BlockChartPoint>()
        .x((point) => (xScale(point.label) || 0) + xScale.bandwidth() / 2)
        .y((point) => ySecondaryScale(point.secondary || 0))
        .curve(d3.curveMonotoneX)
      linePath = lineBuilder(chartData) as string | undefined
    }

    return {
      chartData,
      xScale,
      yTxScale,
      yTicks: yTxScale.ticks(4),
      linePath,
    }
  }, [blocks, chain, innerHeight, innerWidth])

  const getSecondaryLabel = () => {
    switch (chain) {
      case 'eth':
        return 'Gas 使用率'
      case 'btc':
        return '区块大小 (KB)'
      case 'sol':
        return 'TPS'
      default:
        return ''
    }
  }

  return (
    <svg
      className="block-chart"
      viewBox={`0 0 ${CHART_SIZE.width} ${CHART_SIZE.height}`}
      role="img"
    >
      <title>区块链数据可视化</title>
      <g transform={`translate(${CHART_MARGIN.left} ${CHART_MARGIN.top})`}>
        {yTicks.map((tick) => (
          <g key={tick} transform={`translate(0 ${yTxScale(tick)})`}>
            <line className="grid-line" x2={innerWidth} />
            <text className="axis-label" x={-12} dy="0.32em" textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        {chartData.map((point) => {
          const barX = xScale(point.label) || 0
          const barHeight = innerHeight - yTxScale(point.tx)

          return (
            <g key={point.label}>
              <rect
                className="tx-bar"
                x={barX}
                y={yTxScale(point.tx)
                }
                width={xScale.bandwidth()}
                height={barHeight}
                rx="4"
              />
              <text
                className="x-label"
                x={barX + xScale.bandwidth() / 2}
                y={innerHeight + 24}
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          )
        })}

        {linePath && (
          <path className="gas-line" d={linePath} />
        )}
      </g>

      <text
        className="legend-text"
        x={CHART_MARGIN.left}
        y={CHART_SIZE.height - 5}
        style={{ fontSize: '12px', fill: 'var(--muted)' }}
      >
        区块高度
      </text>

      <g className="legend" transform={`translate(${CHART_SIZE.width - 200}, 20)`}>
        <rect
          x="0"
          y="0"
          width="18"
          height="10"
          fill="var(--bar)"
          rx="2"
        />
        <text x="24" y="9" fill="var(--muted)" fontSize="12px" fontWeight="700">
          交易数
        </text>

        {linePath && (
          <>
            <line
              x1="80"
              y1="5"
              x2="98"
              y2="5"
              stroke="var(--line)"
              strokeWidth="3"
            />
            <text
              x="104"
              y="9"
              fill="var(--muted)"
              fontSize="12px"
              fontWeight="700"
            >
              {getSecondaryLabel()}
            </text>
          </>
        )}
      </g>
    </svg>
  )
}

export const BlockChart = memo(BlockChartComponent, (prev, next) => {
  if (prev.chain !== next.chain) return false
  if (prev.blocks.length !== next.blocks.length) return false
  return prev.blocks.every((block, index) => {
    const nextBlock = next.blocks[index]
    return (
      block.number === nextBlock.number &&
      block.transactions === nextBlock.transactions
    )
  })
})
