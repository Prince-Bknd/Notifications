"use client"

import { useState, useRef, useCallback } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import type { Notification } from "../types/notification"

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const clientRef = useRef<Client | null>(null)

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
    }, 5000)
  }, [])

  const connectWebSocket = useCallback(() => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)
    setConnectionStatus("Connecting...")

    const client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080/ws"),
      connectHeaders: {
        login: "user",
        passcode: "password",
      },
      debug: (str) => {
        if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
          console.log("STOMP Debug:", str)
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionStatus("Connected")

      addNotification({
        type: "success",
        title: "Connection Established",
        message: "Successfully connected to WebSocket server via STOMP over SockJS",
      })

      // Subscribe to a topic for demo purposes
      client.subscribe("/topic/notifications", (message) => {
        const data = JSON.parse(message.body)
        addNotification({
          type: "info",
          title: "Message Received",
          message: data.content || "New message from server",
        })
      })

      // Send a test message
      setTimeout(() => {
        client.publish({
          destination: "/app/hello",
          body: JSON.stringify({ message: "Hello from client!" }),
        })
      }, 1000)
    }

    client.onStompError = (frame) => {
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus("Connection Error")

      addNotification({
        type: "error",
        title: "Connection Failed",
        message: `STOMP error: ${frame.headers["message"] || "Unknown error"}`,
      })
    }

    client.onWebSocketClose = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus("Disconnected")

      addNotification({
        type: "warning",
        title: "Connection Closed",
        message: "WebSocket connection has been closed",
      })
    }

    client.onWebSocketError = () => {
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus("Connection Error")

      addNotification({
        type: "error",
        title: "WebSocket Error",
        message: "Failed to establish WebSocket connection",
      })
    }

    clientRef.current = client
    client.activate()
  }, [isConnected, isConnecting, addNotification])

  const disconnectWebSocket = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
      setIsConnected(false)
      setConnectionStatus("Disconnected")

      addNotification({
        type: "info",
        title: "Disconnected",
        message: "WebSocket connection has been closed",
      })
    }
  }, [addNotification])

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    notifications,
    connectWebSocket,
    disconnectWebSocket,
    addNotification,
  }
}
