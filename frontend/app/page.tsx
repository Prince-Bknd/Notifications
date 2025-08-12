"use client"

import { useState, useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wifi, WifiOff, Zap, Globe, MessageSquare, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useEnv } from "@/hooks/use-env"
import { useBackendStatus } from "@/hooks/use-backend-status"
import { useWebSocket } from "@/hooks/useWebSocket"
import HealthIndicator from "@/components/HealthIndicator/HealthIndicator"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
}

function FloatingParticles({ color }: { color: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-30"
          style={{ backgroundColor: color }}
          initial={{
            x: Math.random() * 1200,
            y: Math.random() * 800,
          }}
          animate={{
            x: Math.random() * 1200,
            y: Math.random() * 800,
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-10 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.5) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.5) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

export default function WebSocketApp() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const { appEnv, websocketUrl } = useEnv()
  const { status, getAnimationClass, getColorClasses } = useBackendStatus()
  const { 
    isConnected, 
    isConnecting, 
    connectionAttempts, 
    maxAttempts, 
    canReconnect,
    connect, 
    disconnect, 
    manualReconnect,
    subscribe,
    publish 
  } = useWebSocket()

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)])

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
    }, 5000)
  }

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("Connected")
      addNotification({
        type: "success",
        title: "Connection Established",
        message: "Successfully connected to WebSocket server via STOMP over SockJS",
      })
    } else if (isConnecting) {
      setConnectionStatus("Connecting...")
    } else if (canReconnect) {
      setConnectionStatus("Connection Failed - Click Reconnect")
    } else {
      setConnectionStatus("Disconnected")
    }
  }, [isConnected, isConnecting, canReconnect])

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe("/topic/notifications", (message) => {
        try {
          const data = JSON.parse(message.body)
          addNotification({
            type: "info",
            title: "Message Received",
            message: data.content || "New message from server",
          })
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      })

      setTimeout(() => {
        publish("/app/hello", { message: "Hello from client!" })
      }, 1000)

      return unsubscribe
    }
  }, [isConnected, subscribe, publish])

  const handleConnect = () => {
    connect()
  }

  const handleDisconnect = () => {
    disconnect()
    addNotification({
      type: "info",
      title: "Disconnected",
      message: "WebSocket connection has been closed",
    })
  }

  const handleReconnect = () => {
    manualReconnect()
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-10 opacity-20"
          animate={{
            background: [
              `radial-gradient(circle at 20% 50%, ${status.color}40 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 20%, ${status.color}40 0%, transparent 50%)`,
              `radial-gradient(circle at 40% 80%, ${status.color}40 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 50%, ${status.color}40 0%, transparent 50%)`,
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <FloatingParticles color={status.color} />
      
      <HealthIndicator />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            WebSocket Connection Hub
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Real-time communication using STOMP protocol over SockJS WebSocket connection
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Globe className="h-5 w-5 text-blue-400" />
                      </motion.div>
                      Connection Control
                    </CardTitle>
                    <CardDescription>Manage your WebSocket connection with STOMP and SockJS</CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={`flex items-center justify-between p-4 rounded-lg border backdrop-blur-sm ${getColorClasses(status.color)}`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={getAnimationClass(status.animation)}
                        animate={isConnecting ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        {getStatusIcon()}
                      </motion.div>
                      <div>
                        <span className="font-medium">Status: {connectionStatus}</span>
                        <div className="text-sm opacity-75">
                          Backend: {status.serverLoad} ({status.connectionCount} connections)
                          {connectionAttempts > 0 && (
                            <span className="ml-2">
                              • Attempts: {connectionAttempts}/{maxAttempts}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex gap-2"
                    >
                      <Badge variant={isConnected ? "default" : "secondary"}>
                        {appEnv}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getColorClasses(status.color)}
                      >
                        {status.serverLoad}
                      </Badge>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex gap-4"
                  >
                    {canReconnect ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={handleReconnect}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Activity className="mr-2 h-4 w-4" />
                          </motion.div>
                          Reconnect ({connectionAttempts}/{maxAttempts} attempts)
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={handleConnect}
                          disabled={isConnected || isConnecting}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {isConnecting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Activity className="mr-2 h-4 w-4" />
                              </motion.div>
                              Connecting... ({connectionAttempts}/{maxAttempts})
                            </>
                          ) : (
                            <>
                              <Wifi className="mr-2 h-4 w-4" />
                              Connect WebSocket
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleDisconnect}
                        disabled={!isConnected}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent shadow-lg hover:shadow-xl"
                      >
                        <WifiOff className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="grid md:grid-cols-3 gap-4 mt-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-lg border backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${status.color}10, ${status.color}20)`,
                        borderColor: `${status.color}40`
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Zap className="h-8 w-8 mb-2" style={{ color: status.color }} />
                      </motion.div>
                      <h3 className="font-semibold mb-1" style={{ color: status.color }}>WebSocket</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Full-duplex communication protocol for real-time data exchange
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -8, rotateY: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-lg border backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${status.color}10, ${status.color}20)`,
                        borderColor: `${status.color}40`
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Globe className="h-8 w-8 mb-2" style={{ color: status.color }} />
                      </motion.div>
                      <h3 className="font-semibold mb-1" style={{ color: status.color }}>SockJS</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        WebSocket-like object with fallback options for older browsers
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-lg border backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${status.color}10, ${status.color}20)`,
                        borderColor: `${status.color}40`
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <MessageSquare className="h-8 w-8 mb-2" style={{ color: status.color }} />
                      </motion.div>
                      <h3 className="font-semibold mb-1" style={{ color: status.color }}>STOMP</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Simple Text Oriented Messaging Protocol for message brokers
                      </p>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur-sm h-fit shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                                    <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <MessageSquare className="h-5 w-5 text-green-400" />
                  </motion.div>
                  Live Notifications
                </CardTitle>
                    <CardDescription>Real-time connection events and messages</CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {notifications.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                                                  <motion.div
                          animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        </motion.div>
                          <p>No notifications yet</p>
                          <p className="text-sm">Connect to start receiving updates</p>
                        </motion.div>
                      ) : (
                        notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.8 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 200
                            }}
                            className="p-3 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-700/30 dark:to-gray-600/30 rounded-lg border-l-4 border-l-blue-500 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-2">
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                {getNotificationIcon(notification.type)}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <CardTitle>Technology Overview</CardTitle>
                  <CardDescription>Understanding the technologies powering this real-time application</CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">WebSocket Protocol</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      WebSocket is a communication protocol that provides full-duplex communication channels over a single
                      TCP connection. Unlike traditional HTTP requests, WebSocket connections remain open, allowing for
                      real-time, bidirectional data exchange between client and server.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">SockJS Library</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      SockJS is a JavaScript library that provides a WebSocket-like object with fallback options. It
                      automatically chooses the best transport method available, ensuring compatibility across different
                      browsers and network configurations, including older browsers that don't support WebSocket.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300 mb-3">STOMP Protocol</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      STOMP (Simple Text Oriented Messaging Protocol) is a messaging protocol that defines the format and
                      rules for data exchange. It provides a frame-based protocol with commands like CONNECT, SEND,
                      SUBSCRIBE, and DISCONNECT, making it easy to work with message brokers.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Environment Configuration</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      This application uses environment-specific configurations to handle different deployment scenarios.
                      Development environment connects to localhost, while production uses secure WebSocket connections
                      (WSS) for encrypted communication in production deployments.
                    </p>
                  </motion.div>
                </motion.div>

                <Separator className="bg-gray-300 dark:bg-gray-700" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Current Environment:{" "}
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Badge variant="outline">{appEnv}</Badge>
                    </motion.span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    WebSocket URL: {websocketUrl}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
