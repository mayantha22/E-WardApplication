package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(unique = true, length = 50)
    private String employeeNumber;

    private String phone;
    private String designation;
    private String ward;
    private String email;

    @Column(name = "address", length = 255)
    private String address;

    private int leaveCount = 0;
    private int nightDutyCount = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

//    @OneToMany(mappedBy = "recordedBy", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<PatientUpdate> patientUpdates;
}
