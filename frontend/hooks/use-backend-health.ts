import { useState, useEffect } from 'react'
import { useEnv } from './use-env'

interface BackendHealth {
  isHealthy: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
}

export function useBackendHealth() {
  const [health, setHealth] = useState<BackendHealth>({
    isHealthy: false,
    isChecking: false,
    lastChecked: null,
    error: null
  })
  
  const { backendUrl } = useEnv()

  const checkHealth = async () => {
    setHealth(prev => ({ ...prev, isChecking: true, error: null }))
    
    try {
      // Try to connect to the backend health endpoint
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        setHealth({
          isHealthy: true,
          isChecking: false,
          lastChecked: new Date(),
          error: null
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setHealth({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    // Check health immediately on mount
    checkHealth()

    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    ...health,
    checkHealth
  }
} 