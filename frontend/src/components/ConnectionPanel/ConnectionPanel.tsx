"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Wifi, WifiOff, Activity, CheckCircle, XCircle } from "lucide-react"
import { useEnv } from "@/hooks/use-env"

import TechnologyCards from "../TechnologyCards/TechnologyCards"
import "./ConnectionPanel.css"

interface ConnectionPanelProps {
  isConnected: boolean
  isConnecting: boolean
  connectionStatus: string
  onConnect: () => void
  onDisconnect: () => void
}

export default function ConnectionPanel({
  isConnected,
  isConnecting,
  connectionStatus,
  onConnect,
  onDisconnect,
}: ConnectionPanelProps) {
  const { appEnv } = useEnv()
  const getStatusIcon = () => {
    if (isConnecting) return <Activity className="status-icon animate-spin" />
    if (isConnected) return <CheckCircle className="status-icon status-connected" />
    return <XCircle className="status-icon status-disconnected" />
  }

  return (
    <Card className="connection-panel-card">
      <CardHeader>
        <CardTitle className="connection-panel-title">
          <Globe className="title-icon" />
          Connection Control
        </CardTitle>
        <CardDescription>Manage your WebSocket connection with STOMP and SockJS</CardDescription>
      </CardHeader>
      <CardContent className="connection-panel-content">
        {/* Status Display */}
        <div className="status-display">
          <div className="status-info">
            {getStatusIcon()}
            <span className="status-text">Status: {connectionStatus}</span>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="env-badge">
            {appEnv}
          </Badge>
        </div>

        {/* Connection Buttons */}
        <div className="connection-buttons">
          <Button onClick={onConnect} disabled={isConnected || isConnecting} className="connect-button">
            {isConnecting ? (
              <>
                <Activity className="button-icon animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wifi className="button-icon" />
                Connect WebSocket
              </>
            )}
          </Button>

          <Button
            onClick={onDisconnect}
            disabled={!isConnected}
            variant="outline"
            className="disconnect-button bg-transparent"
          >
            <WifiOff className="button-icon" />
            Disconnect
          </Button>
        </div>

        {/* Technology Cards */}
        <TechnologyCards />
      </CardContent>
    </Card>
  )
}
