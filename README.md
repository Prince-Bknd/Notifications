# 🎨 Animated WebSocket Application

A real-time WebSocket application with dynamic animations that change based on backend status and connection load.

## ✨ Features

### Backend Animations
- **Dynamic Color Changes**: Backend status affects frontend colors
- **Connection-based Animations**: Different animations based on connection count
- **Real-time Status Updates**: WebSocket-based status broadcasting
- **Heartbeat System**: Periodic status updates with animations
- **Load-based Color Coding**:
  - 🟢 Green: Low load (0-2 connections)
  - 🔵 Blue: Medium load (3-5 connections)
  - 🟣 Purple: High load (6-10 connections)
  - 🟠 Orange: Overload (10+ connections)
  - 🔴 Red: No connections

### Frontend Animations
- **Dynamic Background**: Animated gradients that change with backend colors
- **Floating Particles**: Particles that match backend color scheme
- **Interactive Cards**: Technology cards with 3D hover effects
- **Status Indicators**: Real-time status with backend-driven animations
- **Smooth Transitions**: All animations use Framer Motion for 60fps performance

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Backend Endpoints

### REST API
- `GET /api/health` - Health check with status
- `GET /api/status` - Current backend status
- `POST /api/connect` - Simulate connection
- `POST /api/disconnect` - Simulate disconnection

### WebSocket Topics
- `/topic/notifications` - Real-time notifications
- `/topic/status` - Backend status updates
- `/app/hello` - Connection message
- `/app/disconnect` - Disconnection message

## 🎭 Animation Types

### Backend-Driven Animations
- **Pulse**: Low activity
- **Bounce**: Medium activity
- **Spin**: High activity
- **Wiggle**: Very high activity
- **Shake**: Error/Disconnection

### Frontend Animations
- **3D Card Effects**: Hover with rotateY transforms
- **Floating Particles**: Dynamic particle system
- **Gradient Backgrounds**: Animated radial gradients
- **Icon Rotations**: Interactive icon animations
- **Status Badges**: Color-coded status indicators

## 🎨 Color System

The application uses a dynamic color system that changes based on backend status:

| Status | Color | Animation | Description |
|--------|-------|-----------|-------------|
| IDLE | #ef4444 (Red) | Shake | No connections |
| LOW | #10b981 (Green) | Pulse | 1-2 connections |
| MEDIUM | #3b82f6 (Blue) | Bounce | 3-5 connections |
| HIGH | #8b5cf6 (Purple) | Spin | 6-10 connections |
| OVERLOAD | #f59e0b (Orange) | Wiggle | 10+ connections |

## 🔄 Real-time Features

1. **Connection Monitoring**: Real-time connection count tracking
2. **Status Broadcasting**: Automatic status updates every 10 seconds
3. **Color Synchronization**: Frontend colors sync with backend status
4. **Animation Coordination**: Backend controls frontend animation types
5. **Load Visualization**: Visual representation of server load

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.4**: Main framework
- **Spring WebSocket**: WebSocket support
- **STOMP Protocol**: Message routing
- **SockJS**: WebSocket fallbacks
- **Spring Actuator**: Health monitoring

### Frontend
- **Next.js 14**: React framework
- **Framer Motion**: Animation library
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety
- **STOMP.js**: WebSocket client

## 🎯 Usage

1. **Start both backend and frontend**
2. **Connect to WebSocket** using the frontend interface
3. **Watch animations change** as connection count varies
4. **Monitor backend status** through the status panel
5. **See real-time color changes** throughout the interface

## 🔍 Monitoring

- **Health Check**: `http://localhost:8080/api/health`
- **Status API**: `http://localhost:8080/api/status`
- **Actuator**: `http://localhost:8080/actuator`

## 🎨 Customization

### Adding New Animations
1. Update `getAnimationClass()` in `use-backend-status.ts`
2. Add corresponding CSS classes
3. Update backend animation logic in `WebSocketController.java`

### Adding New Colors
1. Update `getColorClasses()` in `use-backend-status.ts`
2. Add color logic in `HealthController.java`
3. Update status thresholds as needed

## 🚀 Performance

- **60fps Animations**: Optimized with Framer Motion
- **Efficient Rendering**: Client-side only animations to prevent hydration issues
- **Minimal Bundle Size**: Tree-shaken imports
- **Responsive Design**: Works on all screen sizes

## 📝 License

MIT License - feel free to use and modify! 