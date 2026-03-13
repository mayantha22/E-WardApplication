package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
//import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private String type; // INFO, WARNING, ERROR
    private Long recipientId;
    private boolean isRead;
    private Instant createdAt;

}
