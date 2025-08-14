package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "duty_roster")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DutyRoster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int month;
    private int year;
    private String ward;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String data; // JSON string for assignments

    private Instant createdAt = Instant.now();
}
