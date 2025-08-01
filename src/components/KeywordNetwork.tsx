'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Expand, Minimize2, RotateCcw, Info, Maximize2, ZoomIn, ZoomOut, Network, GitBranch, Share2, DollarSign, Hash, TrendingUp, Search } from 'lucide-react'

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
  nodeColorScheme?: {
    center: string
    root: string
    subroot: string
    level2: string
  }
  revenueData?: any
  currentLevel?: 'root' | 'subroot' | 'level2'
  onNodeClick?: (nodeLabel: string) => void
  onLevelChange?: (level: 'root' | 'subroot' | 'level2') => void
  selectedNodeData?: any
  overallMetrics?: any
  productImageUrl?: string
  // Filter controls props
  minKeywordsPerRoot?: number
  minKeywordsPerSubRoot?: number
  onMinKeywordsPerRootChange?: (value: number) => void
  onMinKeywordsPerSubRootChange?: (value: number) => void
  searchTerm?: string
  onSearchTermChange?: (value: string) => void
}

export default function KeywordNetwork({ 
  keywordClusters, 
  primaryKeyword, 
  className = '', 
  nodeColorScheme,
  revenueData,
  currentLevel = 'root',
  onNodeClick,
  onLevelChange,
  selectedNodeData,
  overallMetrics,
  productImageUrl,
  minKeywordsPerRoot = 5,
  minKeywordsPerSubRoot = 5,
  onMinKeywordsPerRootChange,
  onMinKeywordsPerSubRootChange,
  searchTerm = '',
  onSearchTermChange
}: KeywordNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showSubroots, setShowSubroots] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0.9) // Start at a good zoom level to see all nodes
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 })
  
  const height = isFullscreen ? window.innerHeight - 40 : (dimensions.height || 700)
  const width = isFullscreen ? window.innerWidth - 40 : dimensions.width

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && !isFullscreen) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: 700
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [isFullscreen])

  // Handle fullscreen changes (including ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !keywordClusters || !primaryKeyword) return

    // Debug log to check revenue data structure
    console.log('KeywordNetwork - Full revenueData structure:', revenueData)
    console.log('KeywordNetwork - keywordClusters:', keywordClusters)

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Increased padding to prevent node clipping
    const padding = 150

    // Create nodes and links
    const nodes: NetworkNode[] = []
    const links: NetworkLink[] = []

    // Use custom color scheme or default
    const colors = nodeColorScheme || {
      center: '#1F2937',    // gray-800
      root: '#3B82F6',      // blue-500
      subroot: '#10B981',   // green-500
      level2: '#8B5CF6'     // purple-500
    }
    
    // Predefined color palette for different root nodes
    const rootColorPalette = [
      '#3B82F6', // blue-500
      '#10B981', // green-500
      '#8B5CF6', // purple-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
      '#84CC16', // lime-500
      '#06B6D4', // cyan-500
      '#A855F7', // purple-500
      '#FB923C', // orange-400
      '#FBBF24', // yellow-400
      '#34D399'  // emerald-400
    ]
    
    // Map to store root node colors
    const rootNodeColors = new Map()
    let colorIndex = 0
    
    // Function to get revenue for sizing
    const getRevenue = (nodeName: string) => {
      if (!revenueData) return 0
      return revenueData[nodeName]?.totalRevenue || 0
    }
    
    // Function to calculate node size based on revenue
    const calculateNodeSize = (revenue: number, type: string) => {
      const minSize = type === 'center' ? 60 : type === 'cluster' ? 30 : 20
      const maxSize = type === 'center' ? 100 : type === 'cluster' ? 90 : 40
      
      // Scale logarithmically for better visual distribution
      if (revenue <= 0) return minSize
      
      // Find max revenue in the data for better scaling
      let maxRevenue = 0
      if (revenueData) {
        Object.values(revenueData).forEach((data: any) => {
          if (data.totalRevenue > maxRevenue) {
            maxRevenue = data.totalRevenue
          }
        })
      }
      maxRevenue = maxRevenue || 1000000 // Fallback to 1M if no data
      
      // Use linear scale for more noticeable differences
      const scale = Math.min(revenue / maxRevenue, 1)
      const size = minSize + (maxSize - minSize) * scale
      
      console.log(`calculateNodeSize: revenue=${revenue}, maxRevenue=${maxRevenue}, scale=${scale}, size=${size}, type=${type}`)
      
      return size
    }

    // Add center node with keyword count-based sizing - position at true center
    // Calculate total keywords across all clusters
    const totalKeywords = Object.values(keywordClusters || {}).reduce((sum, cluster: any) => {
      const clusterKeywords = (cluster.keywords?.length || 0) + (cluster.subroots ? Object.keys(cluster.subroots).length : 0)
      return sum + clusterKeywords
    }, 0)
    
    // Size based on total keywords (min 80, max 120)
    const centerSize = Math.min(120, Math.max(80, 80 + (totalKeywords / 10)))
    
    nodes.push({
      id: 'center',
      label: productImageUrl ? '' : primaryKeyword, // No label if we have an image
      type: 'center',
      size: centerSize,
      color: colors.center,
      fx: width / 2,
      fy: height / 2
    })

    // Add cluster nodes and their connections
    Object.entries(keywordClusters || {}).forEach(([clusterName, cluster]) => {
      // Determine node color based on current level and type
      let nodeColor = colors.root
      
      if (currentLevel === 'root') {
        // Assign unique color to each root node
        if (!rootNodeColors.has(clusterName)) {
          rootNodeColors.set(clusterName, rootColorPalette[colorIndex % rootColorPalette.length])
          colorIndex++
        }
        nodeColor = rootNodeColors.get(clusterName)
      } else if (currentLevel === 'subroot') {
        nodeColor = colors.root // Roots in subroot view
      } else if (currentLevel === 'level2') {
        nodeColor = colors.subroot // Subroots in level2 view
      }
      
      // Get revenue for sizing
      const revenue = getRevenue(clusterName)
      console.log(`Cluster ${clusterName}: revenue = ${revenue}, revenueData:`, revenueData?.[clusterName])
      const nodeSize = calculateNodeSize(revenue, 'cluster')
      console.log(`Cluster ${clusterName}: calculated size = ${nodeSize}`)
      
      // Add cluster root node with revenue-based sizing
      const clusterId = `cluster-${clusterName}`
      // Initialize node position near center to prevent out-of-bounds spawning
      const angle = Math.random() * 2 * Math.PI
      const radius = 100 + Math.random() * 80 // 100-180px from center (reduced to keep nodes more centered)
      const startX = width / 2 + Math.cos(angle) * radius
      const startY = height / 2 + Math.sin(angle) * radius
      
      nodes.push({
        id: clusterId,
        label: cluster.root,
        type: 'cluster',
        cluster: clusterName,
        size: nodeSize,
        color: nodeColor,
        volume: revenue,
        x: startX,
        y: startY
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
          
          // Determine subroot color based on level
          let subrootColor = colors.subroot
          if (currentLevel === 'level2') {
            subrootColor = colors.level2 // Level 2 nodes in level2 view
          }
          
          // Get revenue for subroot sizing (if available)
          const subrootRevenue = revenueData?.[subroot]?.totalRevenue || 0
          const subrootSize = calculateNodeSize(subrootRevenue, 'subroot')
          
          // Initialize subroot position around the cluster node
          const subrootAngle = (index / cluster.subroots.length) * 2 * Math.PI // Evenly distribute subroots
          const subrootRadius = 60 + Math.random() * 40 // 60-100px from cluster (reduced radius)
          const subrootStartX = (startX || width / 2) + Math.cos(subrootAngle) * subrootRadius
          const subrootStartY = (startY || height / 2) + Math.sin(subrootAngle) * subrootRadius
          
          nodes.push({
            id: subrootId,
            label: subroot,
            type: 'subroot',
            cluster: clusterName,
            size: subrootSize,
            color: subrootColor,
            volume: subrootRevenue,
            x: subrootStartX,
            y: subrootStartY
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
                color: d3.color(clusterColor)?.brighter(1)?.toString() || clusterColor
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

    // Create SVG with expanded viewbox to prevent clipping
    const viewBoxPadding = 200
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-viewBoxPadding, -viewBoxPadding, width + viewBoxPadding * 2, height + viewBoxPadding * 2])
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // Adjust force strength based on number of nodes for better fit
    const nodeCount = nodes.length
    const chargeStrength = nodeCount > 10 ? -1200 : nodeCount > 5 ? -800 : -600
    const linkDistance = nodeCount > 10 ? 180 : nodeCount > 5 ? 140 : 120
    
    // Create simulation with better spacing and collision detection
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .strength(d => d.strength * 0.5)
        .distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        const node = d as NetworkNode
        // Increase collision radius based on text length and node type
        const textLength = node.label.length
        const baseRadius = node.size
        const textRadius = Math.max(textLength * 3, baseRadius * 1.5)
        return textRadius + 20 // Increased spacing
      }))
      .force('x', d3.forceX(width / 2).strength(0.08))
      .force('y', d3.forceY(height / 2).strength(0.08))
      // Add stronger boundary forces to keep nodes within viewport
      .force('boundaryX', d3.forceX().x(d => {
        const node = d as NetworkNode
        const margin = 80
        const x = node.x || width / 2
        return Math.max(margin, Math.min(width - margin, x))
      }).strength(0.3))
      .force('boundaryY', d3.forceY().y(d => {
        const node = d as NetworkNode
        const margin = 80
        const y = node.y || height / 2
        return Math.max(margin, Math.min(height - margin, y))
      }).strength(0.3))

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

    // Add circles or images based on node type
    node.each(function(d) {
      const nodeElement = d3.select(this)
      
      if (d.type === 'center' && productImageUrl) {
        // Add square image with border for center node
        const imageSize = d.size * 1.5 // Make it a bit larger
        
        // Add white background/border
        nodeElement.append('rect')
          .attr('x', -imageSize / 2 - 3)
          .attr('y', -imageSize / 2 - 3)
          .attr('width', imageSize + 6)
          .attr('height', imageSize + 6)
          .attr('fill', 'white')
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 2)
          .attr('rx', 8) // Rounded corners
        
        // Add the image
        nodeElement.append('image')
          .attr('href', productImageUrl)
          .attr('x', -imageSize / 2)
          .attr('y', -imageSize / 2)
          .attr('width', imageSize)
          .attr('height', imageSize)
          .attr('preserveAspectRatio', 'xMidYMid slice')
          .style('clip-path', 'inset(0 round 8px)') // Match the rounded corners
      } else {
        // Regular circle for other nodes
        nodeElement.append('circle')
          .attr('r', d.size)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      }
    })

    // Add labels with improved positioning and text handling
    node.each(function(d) {
      const nodeElement = d3.select(this)
      
      // Determine if text should be inside or outside the node
      // For center node, put text outside if it's too long or if we have an image
      const centerTextTooLong = d.type === 'center' && d.label.length > 20
      const centerHasImage = d.type === 'center' && productImageUrl
      const shouldLabelInside = (d.type === 'center' && !centerTextTooLong && !centerHasImage) || d.type === 'cluster'
      // Give center node more space for text
      const maxWidth = d.type === 'center' ? d.size * 2.5 : (shouldLabelInside ? d.size * 1.6 : d.size * 2.5)
      
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
      
      // Limit lines and add ellipsis if needed - allow more lines for center node
      const maxLines = d.type === 'center' ? 3 : (shouldLabelInside ? 2 : 3)
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines - 1)
        const lastLine = lines[lines.length - 1]
        lines[lines.length - 1] = lastLine.length > 10 ? lastLine.substring(0, 8) + '...' : lastLine
        lines.push('...')
      }
      
      // Position text inside or outside node
      const textY = shouldLabelInside ? 0 : d.size + 15
      // Adjust font size based on whether text is inside or outside
      const fontSize = d.type === 'center' && !shouldLabelInside ? 11 : {
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
        // Handle both circles and images
        if (d.type === 'center' && productImageUrl) {
          const imageSize = d.size * 1.5
          const scaleFactor = 1.1
          const scaledSize = imageSize * scaleFactor
          
          // Scale the background rect
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('x', -scaledSize / 2 - 3)
            .attr('y', -scaledSize / 2 - 3)
            .attr('width', scaledSize + 6)
            .attr('height', scaledSize + 6)
            .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))')
          
          // Scale the image
          d3.select(this).select('image')
            .transition()
            .duration(200)
            .attr('x', -scaledSize / 2)
            .attr('y', -scaledSize / 2)
            .attr('width', scaledSize)
            .attr('height', scaledSize)
        } else {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', d.size * 1.3)
            .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))')
        }
          
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
        // Handle both circles and images
        if (d.type === 'center' && productImageUrl) {
          const imageSize = d.size * 1.5
          
          // Reset background rect
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('x', -imageSize / 2 - 3)
            .attr('y', -imageSize / 2 - 3)
            .attr('width', imageSize + 6)
            .attr('height', imageSize + 6)
            .style('filter', '')
          
          // Reset image size
          d3.select(this).select('image')
            .transition()
            .duration(200)
            .attr('x', -imageSize / 2)
            .attr('y', -imageSize / 2)
            .attr('width', imageSize)
            .attr('height', imageSize)
        } else {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', d.size)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
        }
          
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
        // Call the callback to update scorecards
        if (onNodeClick && d.label) {
          onNodeClick(d.label)
        }
        
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

    // Update positions on simulation tick with boundary constraints
    simulation.on('tick', () => {
      // Constrain node positions to prevent them from going out of bounds
      nodes.forEach(d => {
        const margin = 60
        d.x = Math.max(margin, Math.min(width - margin, d.x || width / 2))
        d.y = Math.max(margin, Math.min(height - margin, d.y || height / 2))
      })
      
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
  }, [keywordClusters, primaryKeyword, isExpanded, showSubroots, height, width, productImageUrl])

  const resetSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart()
    }
    // Reset pan and zoom to defaults
    setPanX(0)
    setPanY(0)
    setZoomLevel(0.9)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true)
        }).catch((err) => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      }
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  const handlePanStart = (event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsPanning(true)
      setLastPanPoint({ x: event.clientX, y: event.clientY })
    }
  }

  const handlePanMove = (event: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x
      const deltaY = event.clientY - lastPanPoint.y
      
      // Apply bounds to prevent excessive panning while still allowing access to edge nodes
      const maxPanDistance = 400 // Reasonable panning range that matches viewBox padding
      
      setPanX(prev => Math.max(-maxPanDistance, Math.min(maxPanDistance, prev + deltaX)))
      setPanY(prev => Math.max(-maxPanDistance, Math.min(maxPanDistance, prev + deltaY)))
      
      setLastPanPoint({ x: event.clientX, y: event.clientY })
    }
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault()
    
    // Determine zoom direction
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    
    // Update zoom level with bounds
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  return (
    <div ref={containerRef} className={`relative bg-gray-50 ${className} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Fullscreen Level Controls */}
      {isFullscreen && onLevelChange && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { id: 'root', label: 'Root Keywords', icon: Network },
              { id: 'subroot', label: 'Subroots', icon: GitBranch },
              { id: 'level2', label: 'Sub Roots (Level 2)', icon: Share2 }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={currentLevel === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLevelChange(tab.id as any)}
                className={`flex items-center space-x-2 ${
                  currentLevel === tab.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Scorecards - More Compact */}
      {isFullscreen && (selectedNodeData || overallMetrics) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {(() => {
              const displayData = selectedNodeData || overallMetrics
              return (
                <>
                  {/* Monthly Revenue */}
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <div>
                          <h3 className="text-xs font-medium text-gray-600">Monthly Revenue</h3>
                          <div className="text-sm font-bold text-gray-900">
                            ${displayData?.totalRevenue >= 1000000 
                              ? (displayData.totalRevenue / 1000000).toFixed(2) + 'M'
                              : displayData?.totalRevenue >= 1000
                              ? (displayData.totalRevenue / 1000).toFixed(0) + 'K'
                              : displayData?.totalRevenue?.toFixed(0) || '0'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Root Keywords */}
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-3 w-3 text-purple-600" />
                        <div>
                          <h3 className="text-xs font-medium text-gray-600">Total Root Keywords</h3>
                          <div className="text-sm font-bold text-gray-900">
                            {selectedNodeData && selectedNodeData.type === 'root' 
                              ? '1' 
                              : displayData?.totalRootKeywords?.toLocaleString() || '0'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Keywords */}
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                        <div>
                          <h3 className="text-xs font-medium text-gray-600">Total Keywords</h3>
                          <div className="text-sm font-bold text-gray-900">
                            {displayData?.keywordCount?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Fullscreen Filter Controls */}
      {isFullscreen && (onMinKeywordsPerRootChange || onMinKeywordsPerSubRootChange) && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-lg p-3">
            <div className="flex-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                <span>Min Keywords Per Root:</span>
                <input
                  type="number"
                  min="0"
                  value={minKeywordsPerRoot}
                  onChange={(e) => onMinKeywordsPerRootChange?.(parseInt(e.target.value) || 0)}
                  className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                <span>Min Keywords Per Sub Root:</span>
                <input
                  type="number"
                  min="0"
                  value={minKeywordsPerSubRoot}
                  onChange={(e) => onMinKeywordsPerSubRootChange?.(parseInt(e.target.value) || 0)}
                  className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom and Control Buttons */}
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
      
      <div 
        className="p-0 w-full h-full" 
        style={{ 
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          position: 'relative'
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onWheel={handleWheel}
      >
        <div style={{ 
          transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`, 
          transformOrigin: 'center', 
          transition: isPanning ? 'none' : 'transform 0.2s',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg ref={svgRef} style={{ width: `${width}px`, height: `${height}px` }} />
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

      <div className="px-4 pb-4 absolute bottom-0 left-0 right-0 bg-white bg-opacity-90">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {currentLevel === 'subroot' && (
              <>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Roots
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Subroots
                </span>
              </>
            )}
            {currentLevel === 'level2' && (
              <>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Subroots
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Level 2 Subroots
                </span>
              </>
            )}
          </div>
          <div className="text-gray-400">
            Node size = Monthly Revenue
          </div>
        </div>
      </div>
    </div>
  )
}