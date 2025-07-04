// API Route: GET /api/health
// Health check endpoint for monitoring all external API integrations

import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { amazonApiService } from '@/lib/amazon-api-service'
import { keywordService } from '@/lib/keyword-service'
import { ExternalAPIService } from '@/lib/external-api-service'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check all service health in parallel
    const [
      aiHealth,
      amazonHealth,
      keywordHealth,
      externalHealth
    ] = await Promise.allSettled([
      aiService.healthCheck(),
      amazonApiService.healthCheck(),
      keywordService.healthCheck(),
      Promise.resolve({ status: 'healthy' }) // External API service placeholder
    ])

    const services = {
      ai: aiHealth.status === 'fulfilled' ? aiHealth.value : { status: 'down', error: aiHealth.reason },
      amazon: amazonHealth.status === 'fulfilled' ? amazonHealth.value : { status: 'down', error: amazonHealth.reason },
      keywords: keywordHealth.status === 'fulfilled' ? keywordHealth.value : { status: 'down', error: keywordHealth.reason },
      external: externalHealth.status === 'fulfilled' ? externalHealth.value : { status: 'down', error: externalHealth.reason }
    }

    // Determine overall system health
    const healthyServices = Object.values(services).filter(service => 
      service.status === 'healthy' || service.status === 'degraded'
    ).length

    const totalServices = Object.keys(services).length
    const healthPercentage = (healthyServices / totalServices) * 100

    let overallStatus: 'healthy' | 'degraded' | 'down'
    if (healthPercentage >= 75) {
      overallStatus = 'healthy'
    } else if (healthPercentage >= 25) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'down'
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services,
      summary: {
        total: totalServices,
        healthy: healthyServices,
        degraded: Object.values(services).filter(s => s.status === 'degraded').length,
        down: Object.values(services).filter(s => s.status === 'down').length,
        healthPercentage: Math.round(healthPercentage)
      },
      environment: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        platform: process.platform
      },
      features: {
        aiAnalysis: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled',
        amazonIntegration: process.env.AMAZON_ACCESS_KEY ? 'enabled' : 'disabled',
        keywordResearch: process.env.AHREFS_API_KEY || process.env.SEMRUSH_API_KEY ? 'enabled' : 'disabled',
        caching: process.env.REDIS_URL ? 'enabled' : 'disabled'
      }
    }

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 206 : 503

    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {},
      summary: {
        total: 0,
        healthy: 0,
        degraded: 0,
        down: 0,
        healthPercentage: 0
      }
    }, { status: 503 })
  }
}

// Enable CORS for health checks
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}