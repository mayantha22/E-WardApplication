package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "change_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_staff_id", nullable = false)
    private staff fromStaff;

    @ManyToOne
    @JoinColumn(name = "to_staff_id", nullable = false)
    private staff toStaff;

    private Instant requestDate = Instant.now();
    private LocalDate requestedShiftDate;

    @Lob
    private String reason;

    private String status; // PENDING, APPROVED, REJECTED
    private Instant decisionDate;

    @ManyToOne
    @JoinColumn(name = "decided_by")
    private AppUser decidedBy;

    private Instant createdAt = Instant.now();

    // UPDATED FIELDS FOR SWAP THING
    private String requestType; // ADMIN_APPROVAL (existing), DIRECT, INDIRECT
    private String shiftFrom;
    private String shiftTo;

    @Column(columnDefinition = "jsonb")
    private String additionalPayload; // keep JSON as String for simplicity
}
