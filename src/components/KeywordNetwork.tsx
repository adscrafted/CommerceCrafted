'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Button } from '@/components/ui/button'
import { Expand, Minimize2, RotateCcw, Info, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'

interface KeywordCluster {
  root: string
  subroots: string[]
  keywords: string[]
}

interface KeywordClusters {
  [key: string]: KeywordCluster
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: 'center' | 'cluster' | 'subroot' | 'keyword'
  cluster?: string
  size: number
  color: string
  volume?: number
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode
  target: string | NetworkNode
  strength: number
}

interface KeywordNetworkProps {
  keywordClusters: KeywordClusters
  primaryKeyword: string
  className?: string
}

export default function KeywordNetwork({ keywordClusters, primaryKeyword, className = '' }: KeywordNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showSubroots, setShowSubroots] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  const height = isFullscreen ? window.innerHeight - 40 : 600
  const width = isFullscreen ? window.innerWidth - 40 : 800

  useEffect(() => {
    if (!svgRef.current || !keywordClusters || !primaryKeyword) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Create nodes and links
    const nodes: NetworkNode[] = []
    const links: NetworkLink[] = []

    // Color scheme for clusters
    const colors = {
      technology: '#3B82F6', // blue
      audio: '#10B981',      // green
      comfort: '#8B5CF6',    // purple
      travel: '#F59E0B',     // amber
      blackout: '#EF4444',   // red
      center: '#1F2937'      // gray-800
    }

    // Add center node with better sizing
    nodes.push({
      id: 'center',
      label: primaryKeyword,
      type: 'center',
      size: 60,
      color: colors.center,
      fx: width / 2,
      fy: height / 2
    })

    // Add cluster nodes and their connections
    Object.entries(keywordClusters || {}).forEach(([clusterName, cluster]) => {
      const clusterColor = colors[clusterName as keyof typeof colors] || '#6B7280'
      
      // Add cluster root node with better sizing
      const clusterId = `cluster-${clusterName}`
      nodes.push({
        id: clusterId,
        label: cluster.root,
        type: 'cluster',
        cluster: clusterName,
        size: 40,
        color: clusterColor
      })

      // Link cluster to center
      links.push({
        source: 'center',
        target: clusterId,
        strength: 1
      })

      // Add subroots if expanded
      if (showSubroots || isExpanded) {
        cluster.subroots.forEach((subroot, index) => {
          const subrootId = `subroot-${clusterName}-${index}`
          nodes.push({
            id: subrootId,
            label: subroot,
            type: 'subroot',
            cluster: clusterName,
            size: 28,
            color: d3.color(clusterColor)?.brighter(0.5)?.toString() || clusterColor
          })

          // Link subroot to cluster
          links.push({
            source: clusterId,
            target: subrootId,
            strength: 0.7
          })

          // Add keywords if fully expanded
          if (isExpanded) {
            cluster.keywords.slice(0, 2).forEach((keyword, keywordIndex) => {
              const keywordId = `keyword-${clusterName}-${index}-${keywordIndex}`
              nodes.push({
                id: keywordId,
                label: keyword,
                type: 'keyword',
                cluster: clusterName,
                size: 22,
                color: d3.color(clusterColor)?.brighter(1)?.toString() || clusterColor,
                volume: Math.floor(Math.random() * 10000) + 1000 // Mock volume
              })

              // Link keyword to subroot
              links.push({
                source: subrootId,
                target: keywordId,
                strength: 0.5
              })
            })
          }
        })
      }
    })

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Create simulation with better spacing and collision detection
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links).id(d => d.id).strength(d => d.strength * 0.6))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        const node = d as NetworkNode
        // Increase collision radius based on text length and node type
        const textLength = node.label.length
        const baseRadius = node.size
        const textRadius = Math.max(textLength * 3, baseRadius * 1.5)
        return textRadius + 10
      }))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))

    simulationRef.current = simulation
    setNodes(nodes)

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', d => Math.sqrt(d.strength * 3))
      .attr('stroke-opacity', 0.6)

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Add circles
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')

    // Add labels with improved positioning and text handling
    node.each(function(d) {
      const nodeElement = d3.select(this)
      
      // Determine if text should be inside or outside the node
      const shouldLabelInside = d.type === 'center' || d.type === 'cluster'
      const maxWidth = shouldLabelInside ? d.size * 1.6 : d.size * 2.5
      
      // Smart text wrapping
      const words = d.label.split(' ')
      let lines = []
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const estimatedWidth = testLine.length * (shouldLabelInside ? 5 : 6)
        
        if (estimatedWidth > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) lines.push(currentLine)
      
      // Limit lines and add ellipsis if needed
      const maxLines = shouldLabelInside ? 2 : 3
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines - 1)
        const lastLine = lines[lines.length - 1]
        lines[lines.length - 1] = lastLine.length > 10 ? lastLine.substring(0, 8) + '...' : lastLine
        lines.push('...')
      }
      
      // Position text inside or outside node
      const textY = shouldLabelInside ? 0 : d.size + 15
      const fontSize = {
        'center': 13,
        'cluster': 11,
        'subroot': 9,
        'keyword': 8
      }[d.type] || 9
      
      // Add background for external labels
      if (!shouldLabelInside && lines.length > 0) {
        const textHeight = lines.length * fontSize * 1.2
        const textWidth = Math.max(...lines.map(line => line.length * fontSize * 0.6))
        
        nodeElement.append('rect')
          .attr('x', -textWidth / 2 - 4)
          .attr('y', textY - fontSize + (fontSize * 0.3))
          .attr('width', textWidth + 8)
          .attr('height', textHeight + 4)
          .attr('fill', 'rgba(255, 255, 255, 0.9)')
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1)
          .attr('rx', 4)
          .style('pointer-events', 'none')
      }
      
      // Add text elements for each line
      lines.forEach((line, i) => {
        const lineY = shouldLabelInside 
          ? (i - (lines.length - 1) / 2) * fontSize * 1.1
          : textY + (i * fontSize * 1.2)
          
        nodeElement.append('text')
          .text(line)
          .attr('text-anchor', 'middle')
          .attr('y', lineY)
          .attr('dy', '0.35em')
          .attr('font-size', `${fontSize}px`)
          .attr('font-weight', d.type === 'center' || d.type === 'cluster' ? 'bold' : 'normal')
          .attr('fill', d => {
            if (shouldLabelInside) return 'white'
            return '#1f2937'
          })
          .attr('stroke', shouldLabelInside ? 'none' : 'white')
          .attr('stroke-width', shouldLabelInside ? 0 : 1)
          .style('pointer-events', 'none')
          .style('paint-order', 'stroke fill')
          .style('text-shadow', shouldLabelInside ? '0 1px 2px rgba(0,0,0,0.3)' : 'none')
      })
    })

    // Add hover and click effects
    node
      .on('mouseenter', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size * 1.3)
          .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))')
          
        // Enhance text visibility on hover
        d3.select(this).selectAll('text')
          .transition()
          .duration(200)
          .style('font-weight', 'bold')
        
        // Highlight connected nodes
        const connectedNodeIds = new Set<string>()
        links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id
          const targetId = typeof link.target === 'string' ? link.target : link.target.id
          if (sourceId === d.id) connectedNodeIds.add(targetId)
          if (targetId === d.id) connectedNodeIds.add(sourceId)
        })
        
        node.selectAll('circle')
          .style('opacity', (nodeData: NetworkNode) => 
            nodeData.id === d.id || connectedNodeIds.has(nodeData.id) ? 1 : 0.3
          )
        
        link.style('opacity', (linkData: NetworkLink) => {
          const sourceId = typeof linkData.source === 'string' ? linkData.source : linkData.source.id
          const targetId = typeof linkData.target === 'string' ? linkData.target : linkData.target.id
          return sourceId === d.id || targetId === d.id ? 1 : 0.1
        })
        
        setSelectedNode(d.id)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
          
        // Reset text styling
        d3.select(this).selectAll('text')
          .transition()
          .duration(200)
          .style('font-weight', d => d.type === 'center' || d.type === 'cluster' ? 'bold' : 'normal')
        
        // Reset opacity
        node.selectAll('circle').style('opacity', 1)
        link.style('opacity', 0.6)
        
        setSelectedNode(null)
      })
      .on('click', function(event, d) {
        // Double-click to focus on a cluster
        if (d.type === 'cluster') {
          const clusterNodes = nodes.filter(n => n.cluster === d.cluster || n.id === d.id)
          const clusterBounds = {
            minX: Math.min(...clusterNodes.map(n => n.x || 0)),
            maxX: Math.max(...clusterNodes.map(n => n.x || 0)),
            minY: Math.min(...clusterNodes.map(n => n.y || 0)),
            maxY: Math.max(...clusterNodes.map(n => n.y || 0))
          }
          
          // Animate to focus on cluster
          simulation.alpha(0.3).restart()
        }
      })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NetworkNode).x!)
        .attr('y1', d => (d.source as NetworkNode).y!)
        .attr('x2', d => (d.target as NetworkNode).x!)
        .attr('y2', d => (d.target as NetworkNode).y!)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [keywordClusters, primaryKeyword, isExpanded, showSubroots, height, width])

  const resetSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart()
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`relative bg-gray-50 rounded-lg border ${className} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-white"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-white"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetSimulation}
          className="bg-white"
          title="Reset positions"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4" style={{ overflow: 'hidden' }}>
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
          <svg ref={svgRef} className="w-full" style={{ height: `${height}px` }} />
        </div>
      </div>
      
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {nodes.find(n => n.id === selectedNode)?.label}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Type: <span className="font-medium capitalize">{nodes.find(n => n.id === selectedNode)?.type.replace('_', ' ')}</span></div>
                {nodes.find(n => n.id === selectedNode)?.cluster && (
                  <div>Cluster: <span className="font-medium capitalize">{nodes.find(n => n.id === selectedNode)?.cluster}</span></div>
                )}
                {nodes.find(n => n.id === selectedNode)?.volume && (
                  <div>Search Volume: <span className="font-medium">{nodes.find(n => n.id === selectedNode)?.volume?.toLocaleString()}/month</span></div>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 pt-2 border-t">
            {nodes.find(n => n.id === selectedNode)?.type === 'center' && "Central keyword - main focus"}
            {nodes.find(n => n.id === selectedNode)?.type === 'cluster' && "Cluster root - click to explore"}
            {nodes.find(n => n.id === selectedNode)?.type === 'subroot' && "Keyword category"}
            {nodes.find(n => n.id === selectedNode)?.type === 'keyword' && "Related search term"}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-800"></div>
            Primary Keyword
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Technology
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Audio
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Comfort
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            Travel
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Blackout
          </span>
        </div>
      </div>
    </div>
  )
}