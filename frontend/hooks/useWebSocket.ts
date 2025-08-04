import { useState, useEffect, useCallback, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEnv } from './use-env'

interface WebSocketMessage {
  body: string
}

type MessageHandler = (message: WebSocketMessage) => void

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [maxAttempts] = useState(3)
  const [canReconnect, setCanReconnect] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const subscriptionsRef = useRef<Map<string, MessageHandler>>(new Map())
  const { websocketUrl, appEnv } = useEnv()

  const connect = useCallback(() => {
    if (isConnected || isConnecting) return
    
    // Check if we've exceeded max attempts
    if (connectionAttempts >= maxAttempts) {
      setCanReconnect(true)
      return
    }

    setIsConnecting(true)
    setConnectionAttempts(prev => prev + 1)

    const client = new Client({
      webSocketFactory: () => new SockJS(websocketUrl),
      connectHeaders: {
        login: 'user',
        passcode: 'password',
      },
      debug: (str) => {
        if (appEnv === 'DEVELOPMENT') {
          console.log('STOMP Debug:', str)
        }
      },
      reconnectDelay: 0, // Disable auto-reconnect
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      setIsConnected(true)
      setIsConnecting(false)
      setCanReconnect(false)
      setConnectionAttempts(0) // Reset attempts on successful connection
      console.log('WebSocket connected successfully')

      // Resubscribe to all topics
      subscriptionsRef.current.forEach((handler, topic) => {
        client.subscribe(topic, handler)
      })
    }

    client.onStompError = (frame) => {
      setIsConnected(false)
      setIsConnecting(false)
      console.error('STOMP error:', frame)
      
      // Check if we should allow manual reconnect
      if (connectionAttempts >= maxAttempts) {
        setCanReconnect(true)
      }
    }

    client.onWebSocketClose = () => {
      setIsConnected(false)
      setIsConnecting(false)
      console.log('WebSocket disconnected')
      
      // Check if we should allow manual reconnect
      if (connectionAttempts >= maxAttempts) {
        setCanReconnect(true)
      }
    }

    client.onWebSocketError = () => {
      setIsConnected(false)
      setIsConnecting(false)
      console.error('WebSocket error')
      
      // Check if we should allow manual reconnect
      if (connectionAttempts >= maxAttempts) {
        setCanReconnect(true)
      }
    }

    clientRef.current = client
    client.activate()
  }, [isConnected, isConnecting, websocketUrl, appEnv, connectionAttempts, maxAttempts])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionAttempts(0)
      setCanReconnect(false)
      subscriptionsRef.current.clear()
    }
  }, [])

  const manualReconnect = useCallback(() => {
    if (canReconnect) {
      setConnectionAttempts(0)
      setCanReconnect(false)
      connect()
    }
  }, [canReconnect, connect])

  const subscribe = useCallback((topic: string, handler: MessageHandler) => {
    subscriptionsRef.current.set(topic, handler)

    if (clientRef.current && isConnected) {
      clientRef.current.subscribe(topic, handler)
    }

    // Return unsubscribe function
    return () => {
      subscriptionsRef.current.delete(topic)
      if (clientRef.current && isConnected) {
        // Note: STOMP.js doesn't provide a direct unsubscribe method
        // The subscription will be cleaned up when the client disconnects
      }
    }
  }, [isConnected])

  const publish = useCallback((destination: string, body: any) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      })
    }
  }, [isConnected])

  useEffect(() => {
    // Only auto-connect on mount if we haven't exceeded attempts
    if (connectionAttempts === 0) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, []) // Remove connect and disconnect from dependencies to prevent infinite loops

  return {
    isConnected,
    isConnecting,
    connectionAttempts,
    maxAttempts,
    canReconnect,
    connect,
    disconnect,
    manualReconnect,
    subscribe,
    publish,
  }
} 