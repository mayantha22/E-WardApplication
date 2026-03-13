package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.NotificationDTO;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getNotificationsForUser(userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteNotification(id);
        return ResponseEntity.ok().build();
    }


}
