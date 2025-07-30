export interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
}
