import { useMemo } from 'react'
import * as d3 from 'd3'
import type { BlockChartPoint, BlockPoint } from '../types/block'

type BlockChartProps = {
  blocks: BlockPoint[]
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

function toChartData(blocks: BlockPoint[]): BlockChartPoint[] {
  return blocks.map((block) => ({
    label: `#${block.number.toString().slice(-4)}`,
    tx: block.transactions,
    gasRatio: Number(block.gasUsed) / Number(block.gasLimit || 1n),
  }))
}

export function BlockChart({ blocks }: BlockChartProps) {
  const innerWidth = CHART_SIZE.width - CHART_MARGIN.left - CHART_MARGIN.right
  const innerHeight = CHART_SIZE.height - CHART_MARGIN.top - CHART_MARGIN.bottom

  const { chartData, xScale, yTxScale, yGasScale, yTicks, gasLinePath } = useMemo(() => {
    const chartData = toChartData(blocks)

    const xScale = d3
      .scaleBand<string>()
      .domain(chartData.map((point) => point.label))
      .range([0, innerWidth])
      .padding(0.28)

    const txMax = d3.max(chartData, (point) => point.tx) ?? 1
    const yTxScale = d3.scaleLinear().domain([0, txMax]).nice().range([innerHeight, 0])
    const yGasScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

    const gasLineBuilder = d3
      .line<BlockChartPoint>()
      .x((point) => (xScale(point.label) ?? 0) + xScale.bandwidth() / 2)
      .y((point) => yGasScale(point.gasRatio))
      .curve(d3.curveMonotoneX)

    return {
      chartData,
      xScale,
      yTxScale,
      yGasScale,
      yTicks: yTxScale.ticks(4),
      gasLinePath: gasLineBuilder(chartData),
    }
  }, [blocks, innerHeight, innerWidth])

  return (
    <svg className="block-chart" viewBox={`0 0 ${CHART_SIZE.width} ${CHART_SIZE.height}`} role="img">
      <title>以太坊最近区块交易数与 Gas 使用率</title>
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
          const barX = xScale(point.label) ?? 0
          const barHeight = innerHeight - yTxScale(point.tx)

          return (
            <g key={point.label}>
              <rect
                className="tx-bar"
                x={barX}
                y={yTxScale(point.tx)}
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

        <path className="gas-line" d={gasLinePath ?? undefined} />
        {chartData.map((point) => (
          <circle
            className="gas-dot"
            key={`${point.label}-gas`}
            cx={(xScale(point.label) ?? 0) + xScale.bandwidth() / 2}
            cy={yGasScale(point.gasRatio)}
            r="5"
          />
        ))}
      </g>
    </svg>
  )
}
