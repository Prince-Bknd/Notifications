"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import type { Notification } from "../../types/notification"
import "./NotificationPanel.css"

interface NotificationPanelProps {
  notifications: Notification[]
}

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="notification-icon success-icon" />
      case "error":
        return <XCircle className="notification-icon error-icon" />
      case "warning":
        return <AlertCircle className="notification-icon warning-icon" />
      default:
        return <MessageSquare className="notification-icon info-icon" />
    }
  }

  return (
    <Card className="notification-panel-card">
      <CardHeader>
        <CardTitle className="notification-panel-title">
          <MessageSquare className="panel-title-icon" />
          Live Notifications
        </CardTitle>
        <CardDescription>Real-time connection events and messages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="notifications-container">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-notifications">
                <MessageSquare className="empty-icon" />
                <p className="empty-title">No notifications yet</p>
                <p className="empty-subtitle">Connect to start receiving updates</p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="notification-item"
                >
                  <div className="notification-content">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-text">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">{notification.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
