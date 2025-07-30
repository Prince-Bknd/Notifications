"use client"

import { useState, useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wifi, WifiOff, Zap, Globe, MessageSquare, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEnv } from "@/hooks/use-env"
import HealthIndicator from "@/components/HealthIndicator/HealthIndicator"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
}

export default function WebSocketApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const clientRef = useRef<Client | null>(null)
  const { appEnv, websocketUrl } = useEnv()

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
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
  }

  const connectWebSocket = () => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)
    setConnectionStatus("Connecting...")

    const client = new Client({
      webSocketFactory: () => new SockJS(websocketUrl),
      connectHeaders: {
        login: "user",
        passcode: "password",
      },
      debug: (str) => {
        if (appEnv === "DEVELOPMENT") {
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
  }

  const disconnectWebSocket = () => {
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
  }

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
    }
  }, [])

  const getStatusIcon = () => {
    if (isConnecting) return <Activity className="h-4 w-4 animate-spin" />
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Health Indicator */}
      <HealthIndicator />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            WebSocket Connection Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time communication using STOMP protocol over SockJS WebSocket connection
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Connection Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  Connection Control
                </CardTitle>
                <CardDescription>Manage your WebSocket connection with STOMP and SockJS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Display */}
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <span className="font-medium">Status: {connectionStatus}</span>
                  </div>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {appEnv}
                  </Badge>
                </div>

                {/* Connection Button */}
                <div className="flex gap-4">
                  <Button
                    onClick={connectWebSocket}
                    disabled={isConnected || isConnecting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    {isConnecting ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        Connect WebSocket
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={disconnectWebSocket}
                    disabled={!isConnected}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
                  >
                    <WifiOff className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>

                {/* Technology Info */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20"
                  >
                    <Zap className="h-8 w-8 text-blue-400 mb-2" />
                    <h3 className="font-semibold text-blue-300">WebSocket</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Full-duplex communication protocol for real-time data exchange
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20"
                  >
                    <Globe className="h-8 w-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-purple-300">SockJS</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      WebSocket-like object with fallback options for older browsers
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-lg border border-pink-500/20"
                  >
                    <MessageSquare className="h-8 w-8 text-pink-400 mb-2" />
                    <h3 className="font-semibold text-pink-300">STOMP</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Simple Text Oriented Messaging Protocol for message brokers
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Live Notifications
                </CardTitle>
                <CardDescription>Real-time connection events and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 text-gray-500"
                      >
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                        <p className="text-sm">Connect to start receiving updates</p>
                      </motion.div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="p-3 bg-gray-700/30 rounded-lg border-l-4 border-l-blue-500"
                        >
                          <div className="flex items-start gap-2">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Technology Overview</CardTitle>
              <CardDescription>Understanding the technologies powering this real-time application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">WebSocket Protocol</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    WebSocket is a communication protocol that provides full-duplex communication channels over a single
                    TCP connection. Unlike traditional HTTP requests, WebSocket connections remain open, allowing for
                    real-time, bidirectional data exchange between client and server.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">SockJS Library</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    SockJS is a JavaScript library that provides a WebSocket-like object with fallback options. It
                    automatically chooses the best transport method available, ensuring compatibility across different
                    browsers and network configurations, including older browsers that don't support WebSocket.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-pink-300 mb-3">STOMP Protocol</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    STOMP (Simple Text Oriented Messaging Protocol) is a messaging protocol that defines the format and
                    rules for data exchange. It provides a frame-based protocol with commands like CONNECT, SEND,
                    SUBSCRIBE, and DISCONNECT, making it easy to work with message brokers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Environment Configuration</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This application uses environment-specific configurations to handle different deployment scenarios.
                    Development environment connects to localhost, while production uses secure WebSocket connections
                    (WSS) for encrypted communication in production deployments.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

                              <div className="text-center">
                  <div className="text-gray-400 text-sm">
                    Current Environment:{" "}
                    <Badge variant="outline">{appEnv}</Badge>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    WebSocket URL: {websocketUrl}
                  </div>
                </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
