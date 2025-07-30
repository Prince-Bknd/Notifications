import { useState, useEffect } from 'react'

export function useEnv() {
  const [env, setEnv] = useState({
    appEnv: 'DEVELOPMENT',
    websocketUrl: 'ws://localhost:8080/ws',
    backendUrl: 'http://localhost:8080'
  })

  useEffect(() => {
    setEnv({
      appEnv: process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() || 'DEVELOPMENT',
      websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws',
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    })
  }, [])

  return env
} 