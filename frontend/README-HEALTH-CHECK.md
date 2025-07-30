# Backend Health Check Feature

## Overview
This feature adds a real-time health indicator in the top-right corner of the application that monitors the backend connection status.

## Features

### Health Indicator Component
- **Location**: Top-right corner of the application
- **Visual States**:
  - 🟢 **Green**: Backend is online and healthy
  - 🔴 **Red**: Backend is offline or unhealthy
  - 🟡 **Yellow**: Checking backend status (with spinning animation)

### Interactive Features
- **Hover**: Shows detailed information including:
  - Current status (Healthy/Unhealthy)
  - Last check timestamp
  - Error details (if any)
  - Click to refresh instruction
- **Click**: Manually refresh the health check

### Automatic Monitoring
- **Initial Check**: Performed immediately when the component mounts
- **Periodic Checks**: Automatically checks every 30 seconds
- **Timeout**: 5-second timeout to prevent hanging requests

## Technical Implementation

### Frontend Components
1. **HealthIndicator** (`/components/HealthIndicator/HealthIndicator.tsx`)
   - Main UI component with hover effects and animations
   - Responsive design for mobile devices

2. **useBackendHealth Hook** (`/hooks/use-backend-health.ts`)
   - Manages health check state and logic
   - Handles automatic periodic checks
   - Provides error handling and timeout management

3. **API Route** (`/app/api/health/route.ts`)
   - Server-side endpoint that proxies health checks to backend
   - Returns standardized health status responses

### Backend Requirements
The backend must have Spring Boot Actuator configured with:
- Health endpoint: `/actuator/health`
- Exposed endpoints: `health`, `info`
- Health details enabled

### Environment Variables
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080  # Backend base URL
```

## Usage

### Adding to a Page
```tsx
import HealthIndicator from "@/components/HealthIndicator/HealthIndicator"

export default function MyPage() {
  return (
    <div>
      <HealthIndicator />
      {/* Your page content */}
    </div>
  )
}
```

### Manual Health Check
```tsx
import { useBackendHealth } from "@/hooks/use-backend-health"

export default function MyComponent() {
  const { checkHealth, isHealthy, isChecking } = useBackendHealth()
  
  return (
    <button onClick={checkHealth} disabled={isChecking}>
      Check Backend Health
    </button>
  )
}
```

## Styling
The component uses custom CSS with:
- Glassmorphism effects (backdrop blur)
- Smooth animations and transitions
- Responsive design
- Dark theme compatibility

## Error Handling
- Network timeouts (5 seconds)
- HTTP error responses
- Connection failures
- CORS issues

## Performance
- Lightweight implementation
- Efficient polling (30-second intervals)
- Minimal impact on application performance
- Automatic cleanup on component unmount 