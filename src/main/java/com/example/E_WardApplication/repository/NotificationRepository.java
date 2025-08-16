package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification , Long> {
}
