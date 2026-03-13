package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.NotificationDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.entity.Notification;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.repository.NotificationRepository;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;

    @Override
    public NotificationDTO createNotification(Long recipientUserId, String message, String type) {
        AppUser recipient = appUserRepository.findById(recipientUserId).orElseThrow(() -> new RuntimeException("User not found"));
        Notification n = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        Notification saved = notificationRepository.save(n);
        return toDto(saved);
    }

    @Override
    public void createNotificationForRole(String roleName, String message, String type) {
        appUserRepository.findByRole(AppUser.Role.valueOf(roleName)).forEach(user -> {
            Notification n = Notification.builder()
                    .recipient(user)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build();
            notificationRepository.save(n);
        });
    }

    @Override
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO toDto(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        dto.setRecipientId(n.getRecipient() != null ? n.getRecipient().getId() : null);
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}

