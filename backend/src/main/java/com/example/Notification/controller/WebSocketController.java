package com.example.Notification.controller;

import com.example.Notification.model.NotificationMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Random;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();
    private int connectionCount = 0;

    @MessageMapping("/hello")
    @SendTo("/topic/notifications")
    public NotificationMessage handleHello(String message) {
        connectionCount++;
        
        // Generate animated notification based on connection count
        String color = getColorForConnection(connectionCount);
        String animation = getAnimationForConnection(connectionCount);
        
        NotificationMessage notification = new NotificationMessage(
            "success",
            "Connection Established",
            "Client connected successfully! Connection #" + connectionCount,
            color,
            animation
        );
        
        // Send animated status update
        sendAnimatedStatusUpdate(color, animation);
        
        return notification;
    }

    @MessageMapping("/disconnect")
    @SendTo("/topic/notifications")
    public NotificationMessage handleDisconnect(String message) {
        connectionCount = Math.max(0, connectionCount - 1);
        
        String color = connectionCount > 0 ? "#3b82f6" : "#ef4444";
        String animation = connectionCount > 0 ? "pulse" : "shake";
        
        NotificationMessage notification = new NotificationMessage(
            "warning",
            "Client Disconnected",
            "Client disconnected. Active connections: " + connectionCount,
            color,
            animation
        );
        
        sendAnimatedStatusUpdate(color, animation);
        
        return notification;
    }

    @Scheduled(fixedRate = 10000) // Every 10 seconds
    public void sendHeartbeat() {
        if (connectionCount > 0) {
            String[] colors = {"#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"};
            String[] animations = {"pulse", "bounce", "spin", "wiggle"};
            
            String color = colors[random.nextInt(colors.length)];
            String animation = animations[random.nextInt(animations.length)];
            
            NotificationMessage heartbeat = new NotificationMessage(
                "info",
                "Server Heartbeat",
                "Server is running smoothly with " + connectionCount + " active connections",
                color,
                animation
            );
            
            messagingTemplate.convertAndSend("/topic/notifications", heartbeat);
            sendAnimatedStatusUpdate(color, animation);
        }
    }

    private String getColorForConnection(int count) {
        if (count <= 1) return "#10b981"; // Green
        if (count <= 3) return "#3b82f6"; // Blue
        if (count <= 5) return "#8b5cf6"; // Purple
        return "#f59e0b"; // Orange for high load
    }

    private String getAnimationForConnection(int count) {
        if (count <= 1) return "pulse";
        if (count <= 3) return "bounce";
        if (count <= 5) return "spin";
        return "wiggle";
    }

    private void sendAnimatedStatusUpdate(String color, String animation) {
        // Send status update to frontend for color changes
        messagingTemplate.convertAndSend("/topic/status", new StatusUpdate(color, animation, connectionCount));
    }

    // Inner class for status updates
    public static class StatusUpdate {
        private String color;
        private String animation;
        private int connectionCount;

        public StatusUpdate(String color, String animation, int connectionCount) {
            this.color = color;
            this.animation = animation;
            this.connectionCount = connectionCount;
        }

        // Getters
        public String getColor() { return color; }
        public String getAnimation() { return animation; }
        public int getConnectionCount() { return connectionCount; }
    }
} 