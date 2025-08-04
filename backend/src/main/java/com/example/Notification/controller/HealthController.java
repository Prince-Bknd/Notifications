package com.example.Notification.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@EnableScheduling
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private int connectionCount = 0;
    private String currentColor = "#10b981";
    private String currentAnimation = "pulse";

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("connections", connectionCount);
        health.put("color", currentColor);
        health.put("animation", currentAnimation);
        health.put("message", "Backend is running with animated status");
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("connections", connectionCount);
        status.put("color", currentColor);
        status.put("animation", currentAnimation);
        status.put("serverLoad", getServerLoad());
        
        return ResponseEntity.ok(status);
    }

    @PostMapping("/connect")
    public ResponseEntity<Map<String, Object>> connect() {
        connectionCount++;
        updateStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Connected successfully");
        response.put("connectionId", connectionCount);
        response.put("color", currentColor);
        response.put("animation", currentAnimation);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/disconnect")
    public ResponseEntity<Map<String, Object>> disconnect() {
        connectionCount = Math.max(0, connectionCount - 1);
        updateStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Disconnected");
        response.put("remainingConnections", connectionCount);
        response.put("color", currentColor);
        response.put("animation", currentAnimation);
        
        return ResponseEntity.ok(response);
    }

    private void updateStatus() {
        // Update color based on connection count
        if (connectionCount == 0) {
            currentColor = "#ef4444"; // Red
            currentAnimation = "shake";
        } else if (connectionCount <= 2) {
            currentColor = "#10b981"; // Green
            currentAnimation = "pulse";
        } else if (connectionCount <= 5) {
            currentColor = "#3b82f6"; // Blue
            currentAnimation = "bounce";
        } else if (connectionCount <= 10) {
            currentColor = "#8b5cf6"; // Purple
            currentAnimation = "spin";
        } else {
            currentColor = "#f59e0b"; // Orange
            currentAnimation = "wiggle";
        }

        // Send status update via WebSocket
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("color", currentColor);
        statusUpdate.put("animation", currentAnimation);
        statusUpdate.put("connectionCount", connectionCount);
        
        messagingTemplate.convertAndSend("/topic/status", statusUpdate);
    }

    private String getServerLoad() {
        if (connectionCount == 0) return "IDLE";
        if (connectionCount <= 2) return "LOW";
        if (connectionCount <= 5) return "MEDIUM";
        if (connectionCount <= 10) return "HIGH";
        return "OVERLOAD";
    }
} 