package com.example.E_WardApplication.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;


@Entity
@Table(name = "patient")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String medicalRecordNumber;

    @Column(nullable = false)
    private String fullName;

    private String nic;
    private String contact;

    @Column(name = "address", length = 255)
    private String address;

    private Instant admissionDate;
    private Instant dischargeDate;

    private String assignedWard;
    private String status;
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PatientUpdate> statusUpdates;


}
