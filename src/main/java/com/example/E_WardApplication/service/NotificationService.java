package com.example.E_WardApplication.service;


import com.example.E_WardApplication.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    //void createNotification(Long id, String s, String patientTransfer);
    NotificationDTO createNotification(Long recipientUserId, String message, String type);
    void createNotificationForRole(String roleName, String message, String type);
    List<NotificationDTO> getNotificationsForUser(Long userId);
    void markAsRead(Long notificationId);
    void deleteNotification(Long notificationId);


}
