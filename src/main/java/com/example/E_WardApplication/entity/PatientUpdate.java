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

    @Builder.Default
    private Instant updateDate = Instant.now();

    @Lob
    private String summary;

    //  Changed from staff → AppUser
    @ManyToOne
    @JoinColumn(name = "recorded_by", nullable = false)
    private AppUser recordedBy;

    //@ManyToOne
    //@JoinColumn(name = "recorded_by", nullable = false)
    //private staff recordedBy;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // 🔹 Ensure timestamps are set before saving
    @PrePersist
    public void prePersist() {
        if (updateDate == null) {
            updateDate = Instant.now();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
