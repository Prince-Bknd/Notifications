import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import "./TechnologyOverview.css"

export default function TechnologyOverview() {
  const technologies = [
    {
      title: "WebSocket Protocol",
      description:
        "WebSocket is a communication protocol that provides full-duplex communication channels over a single TCP connection. Unlike traditional HTTP requests, WebSocket connections remain open, allowing for real-time, bidirectional data exchange between client and server.",
      color: "blue",
    },
    {
      title: "SockJS Library",
      description:
        "SockJS is a JavaScript library that provides a WebSocket-like object with fallback options. It automatically chooses the best transport method available, ensuring compatibility across different browsers and network configurations, including older browsers that don't support WebSocket.",
      color: "purple",
    },
    {
      title: "STOMP Protocol",
      description:
        "STOMP (Simple Text Oriented Messaging Protocol) is a messaging protocol that defines the format and rules for data exchange. It provides a frame-based protocol with commands like CONNECT, SEND, SUBSCRIBE, and DISCONNECT, making it easy to work with message brokers.",
      color: "pink",
    },
    {
      title: "Environment Configuration",
      description:
        "This application uses environment-specific configurations to handle different deployment scenarios. Development environment connects to localhost, while production uses secure WebSocket connections (WSS) for encrypted communication in production deployments.",
      color: "green",
    },
  ]

  return (
    <Card className="technology-overview-card">
      <CardHeader>
        <CardTitle>Technology Overview</CardTitle>
        <CardDescription>Understanding the technologies powering this real-time application</CardDescription>
      </CardHeader>
      <CardContent className="technology-overview-content">
        <div className="technology-grid">
          {technologies.map((tech) => (
            <div key={tech.title} className="technology-section">
              <h3 className={`technology-title tech-${tech.color}`}>{tech.title}</h3>
              <p className="technology-description">{tech.description}</p>
            </div>
          ))}
        </div>

        <Separator className="technology-separator" />

        <div className="environment-info">
          <p className="environment-text">
            Current Environment:{" "}
            <Badge variant="outline" className="environment-badge">
              {process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() || "DEVELOPMENT"}
            </Badge>
          </p>
          <p className="websocket-url">
            WebSocket URL: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080/ws"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
