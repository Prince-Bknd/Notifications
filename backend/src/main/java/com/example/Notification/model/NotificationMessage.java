package com.example.Notification.model;

import java.time.LocalDateTime;

public class NotificationMessage {
    private String id;
    private String type;
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private String color;
    private String animation;

    public NotificationMessage() {}

    public NotificationMessage(String type, String title, String message, String color, String animation) {
        this.id = java.util.UUID.randomUUID().toString();
        this.type = type;
        this.title = title;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.color = color;
        this.animation = animation;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getAnimation() { return animation; }
    public void setAnimation(String animation) { this.animation = animation; }
} 