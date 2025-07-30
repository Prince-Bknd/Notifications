"use client"

import { motion } from "framer-motion"
import { Zap, Globe, MessageSquare } from "lucide-react"
import "./TechnologyCards.css"

export default function TechnologyCards() {
  const technologies = [
    {
      icon: <Zap className="tech-icon" />,
      title: "WebSocket",
      description: "Full-duplex communication protocol for real-time data exchange",
      color: "blue",
    },
    {
      icon: <Globe className="tech-icon" />,
      title: "SockJS",
      description: "WebSocket-like object with fallback options for older browsers",
      color: "purple",
    },
    {
      icon: <MessageSquare className="tech-icon" />,
      title: "STOMP",
      description: "Simple Text Oriented Messaging Protocol for message brokers",
      color: "pink",
    },
  ]

  return (
    <div className="technology-cards-container">
      {technologies.map((tech, index) => (
        <motion.div
          key={tech.title}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className={`technology-card tech-${tech.color}`}
        >
          {tech.icon}
          <h3 className={`tech-title tech-title-${tech.color}`}>{tech.title}</h3>
          <p className="tech-description">{tech.description}</p>
        </motion.div>
      ))}
    </div>
  )
}
