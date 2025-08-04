import { useState, useEffect } from 'react'
import { useWebSocket } from './useWebSocket'

interface BackendStatus {
  color: string
  animation: string
  connectionCount: number
  serverLoad: string
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    color: '#10b981',
    animation: 'pulse',
    connectionCount: 0,
    serverLoad: 'IDLE'
  })

  const { isConnected, subscribe } = useWebSocket()

  useEffect(() => {
    if (!isConnected) return

    // Subscribe to status updates
    const unsubscribe = subscribe('/topic/status', (message) => {
      try {
        const data = JSON.parse(message.body)
        setStatus(prev => ({
          ...prev,
          color: data.color || prev.color,
          animation: data.animation || prev.animation,
          connectionCount: data.connectionCount || prev.connectionCount,
          serverLoad: data.serverLoad || prev.serverLoad
        }))
      } catch (error) {
        console.error('Error parsing status update:', error)
      }
    })

    return unsubscribe
  }, [isConnected, subscribe])

  // Get animation class based on backend animation type
  const getAnimationClass = (animationType: string) => {
    switch (animationType) {
      case 'pulse':
        return 'animate-pulse'
      case 'bounce':
        return 'animate-bounce'
      case 'spin':
        return 'animate-spin'
      case 'wiggle':
        return 'animate-pulse'
      case 'shake':
        return 'animate-pulse'
      default:
        return 'animate-pulse'
    }
  }

  // Get color classes based on backend color
  const getColorClasses = (color: string) => {
    switch (color) {
      case '#10b981': // Green
        return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case '#3b82f6': // Blue
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
      case '#8b5cf6': // Purple
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
      case '#f59e0b': // Orange
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
      case '#ef4444': // Red
        return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return {
    status,
    getAnimationClass,
    getColorClasses,
    isConnected
  }
} 