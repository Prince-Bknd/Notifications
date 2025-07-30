"use client"

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Activity, AlertCircle } from "lucide-react"
import { useBackendHealth } from "@/hooks/use-backend-health"
import "./HealthIndicator.css"

export default function HealthIndicator() {
  const { isHealthy, isChecking, lastChecked, error, checkHealth } = useBackendHealth()
  const [showDetails, setShowDetails] = useState(false)

  const getStatusIcon = () => {
    if (isChecking) return <Activity className="h-3 w-3 animate-spin" />
    if (isHealthy) return <CheckCircle className="h-3 w-3 text-green-500" />
    return <XCircle className="h-3 w-3 text-red-500" />
  }

  const getStatusText = () => {
    if (isChecking) return "Checking..."
    if (isHealthy) return "Backend Online"
    return "Backend Offline"
  }

  const getStatusColor = () => {
    if (isChecking) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (isHealthy) return "bg-green-500/20 text-green-400 border-green-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const formatLastChecked = () => {
    if (!lastChecked) return "Never"
    const now = new Date()
    const diff = now.getTime() - lastChecked.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="health-indicator-container">
      <div 
        className={`health-indicator ${getStatusColor()}`}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        onClick={checkHealth}
      >
        <div className="health-status">
          {getStatusIcon()}
          <span className="health-text">{getStatusText()}</span>
        </div>
        
        {showDetails && (
          <div className="health-details">
            <div className="health-detail-item">
              <span className="detail-label">Status:</span>
              <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
                {isHealthy ? "Healthy" : "Unhealthy"}
              </Badge>
            </div>
            
            <div className="health-detail-item">
              <span className="detail-label">Last Check:</span>
              <span className="detail-value">{formatLastChecked()}</span>
            </div>
            
            {error && (
              <div className="health-detail-item">
                <span className="detail-label">Error:</span>
                <span className="detail-error">{error}</span>
              </div>
            )}
            
            <div className="health-detail-item">
              <span className="detail-label">Click to refresh</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 