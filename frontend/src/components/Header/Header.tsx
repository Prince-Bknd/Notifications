"use client"

import { motion } from "framer-motion"
import "./Header.css"

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="header-container"
    >
      <h1 className="header-title gradient-text">WebSocket Connection Hub</h1>
      <p className="header-subtitle">Real-time communication using STOMP protocol over SockJS WebSocket connection</p>
    </motion.div>
  )
}
