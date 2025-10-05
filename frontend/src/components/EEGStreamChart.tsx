import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { cn } from '../utils/cn'

interface EEGStreamChartProps {
  data: any[]
  channels: string[]
  isStreaming: boolean
  className?: string
}

export const EEGStreamChart: React.FC<EEGStreamChartProps> = ({
  data,
  channels,
  isStreaming,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const margin = { top: 20, right: 30, bottom: 40, left: 60 }

    // Clear previous content
    svg.selectAll('*').remove()

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, 100]) // Show last 100 data points
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([-100, 100]) // EEG signal range
      .range([height - margin.bottom, margin.top])

    // Create line generator
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)

    // Color scale for channels
    const colors = d3.scaleOrdinal(d3.schemeCategory10)

    // Draw channels
    channels.forEach((channel, channelIndex) => {
      const channelData: number[] = []
      const offset = channelIndex * 50 // Offset each channel vertically

      data.forEach((point, index) => {
        if (point.data && point.data[channel]) {
          // Use the first sample from each data point (simplified)
          const value = point.data[channel][0] || 0
          channelData.push(value + offset)
        }
      })

      if (channelData.length > 0) {
        // Create channel group
        const channelGroup = svg.append('g')
          .attr('class', `channel-${channel}`)

        // Draw line
        channelGroup.append('path')
          .datum(channelData)
          .attr('fill', 'none')
          .attr('stroke', colors(channel))
          .attr('stroke-width', isStreaming ? 1.5 : 1)
          .attr('d', line)

        // Add channel label
        svg.append('text')
          .attr('x', margin.left - 10)
          .attr('y', yScale(offset))
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'text-xs font-medium')
          .style('fill', colors(channel))
          .text(channel)

        // Add baseline
        svg.append('line')
          .attr('x1', margin.left)
          .attr('x2', width - margin.right)
          .attr('y1', yScale(offset))
          .attr('y2', yScale(offset))
          .attr('stroke', colors(channel))
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.3)
      }
    })

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d}s`)
      .ticks(5)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d}μV`)
      .ticks(5)

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat(() => '')
      )
      .style('stroke', 'currentColor')
      .style('opacity', 0.1)

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(() => '')
      )
      .style('stroke', 'currentColor')
      .style('opacity', 0.1)

    // Add streaming indicator
    if (isStreaming) {
      svg.append('circle')
        .attr('cx', width - margin.right - 20)
        .attr('cy', margin.top + 10)
        .attr('r', 4)
        .attr('fill', '#10b981')
        .style('animation', 'pulse 2s infinite')

      svg.append('text')
        .attr('x', width - margin.right - 30)
        .attr('y', margin.top + 15)
        .attr('text-anchor', 'end')
        .attr('class', 'text-xs')
        .style('fill', '#10b981')
        .text('LIVE')
    }

  }, [data, channels, isStreaming])

  return (
    <div ref={containerRef} className={cn('w-full h-full', className)}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  )
}
