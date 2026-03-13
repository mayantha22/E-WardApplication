package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id")
    private AppUser recipient;

    @Lob
    private String message;

    private String type;
    private boolean isRead ;

    private Instant createdAt = Instant.now();
}
