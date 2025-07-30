import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the backend URL from environment variable or default to localhost
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    const healthEndpoint = `${backendUrl}/actuator/health`
    
    // Make a request to the backend health endpoint
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(3000)
    })

    if (response.ok) {
      const healthData = await response.json()
      
      return NextResponse.json({
        status: 'healthy',
        backend: 'online',
        timestamp: new Date().toISOString(),
        details: healthData
      })
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        backend: 'offline',
        timestamp: new Date().toISOString(),
        error: `Backend returned ${response.status}: ${response.statusText}`
      }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      backend: 'offline',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to connect to backend'
    }, { status: 503 })
  }
} 