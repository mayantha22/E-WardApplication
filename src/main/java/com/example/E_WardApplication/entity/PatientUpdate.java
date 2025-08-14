package com.example.E_WardApplication.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "patient_update")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PatientUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Instant updateDate = Instant.now();

    @Lob
    private String summary;

    @ManyToOne
    @JoinColumn(name = "recorded_by")
    private staff recordedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

}
