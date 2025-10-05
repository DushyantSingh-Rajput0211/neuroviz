import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { cn } from '../utils/cn'

interface BandPowerChartProps {
  data: Record<string, any>
  channels: string[]
  className?: string
}

export const BandPowerChart: React.FC<BandPowerChartProps> = ({
  data,
  channels,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const margin = { top: 20, right: 30, bottom: 60, left: 80 }

    // Clear previous content
    svg.selectAll('*').remove()

    // Band definitions
    const bands = [
      { name: 'Delta', range: '0.5-4 Hz', color: '#1f77b4' },
      { name: 'Theta', range: '4-8 Hz', color: '#ff7f0e' },
      { name: 'Alpha', range: '8-13 Hz', color: '#2ca02c' },
      { name: 'Beta', range: '13-30 Hz', color: '#d62728' },
      { name: 'Gamma', range: '30-45 Hz', color: '#9467bd' },
    ]

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(bands.map(b => b.name))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(channels, channel => {
        if (!data[channel]) return 0
        return d3.max(bands, band => data[channel][band.name.toLowerCase()] || 0)
      }) || 1])
      .range([height - margin.bottom, margin.top])

    // Color scale for channels
    const channelColors = d3.scaleOrdinal(d3.schemeCategory10)

    // Create groups for each band
    bands.forEach((band, bandIndex) => {
      const bandGroup = svg.append('g')
        .attr('class', `band-${band.name.toLowerCase()}`)

      channels.forEach((channel, channelIndex) => {
        if (!data[channel]) return

        const value = data[channel][band.name.toLowerCase()] || 0
        const x = xScale(band.name)!
        const barWidth = xScale.bandwidth() / channels.length
        const barX = x + channelIndex * barWidth

        // Draw bar
        bandGroup.append('rect')
          .attr('x', barX)
          .attr('y', yScale(value))
          .attr('width', barWidth - 2)
          .attr('height', height - margin.bottom - yScale(value))
          .attr('fill', channelColors(channel))
          .attr('opacity', 0.8)

        // Add value label
        if (value > 0) {
          bandGroup.append('text')
            .attr('x', barX + barWidth / 2)
            .attr('y', yScale(value) - 5)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-xs font-medium')
            .style('fill', channelColors(channel))
            .text(value.toFixed(1))
        }
      })
    })

    // Add axes
    const xAxis = d3.axisBottom(xScale)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d.toFixed(1)}`)

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')

    // Add axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'currentColor')
      .text('Power (μV²)')

    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'currentColor')
      .text('Frequency Bands')

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

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`)

    channels.forEach((channel, index) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${index * 20})`)

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', channelColors(channel))

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .attr('class', 'text-xs')
        .style('fill', 'currentColor')
        .text(channel)
    })

  }, [data, channels])

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
