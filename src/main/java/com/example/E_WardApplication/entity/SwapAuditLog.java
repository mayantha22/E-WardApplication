package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "swap_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwapAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "swap_request_id")
    private SwapRequest swapRequest;

    private String action; // CREATED, PEER_APPROVED, ADMIN_APPROVED, AUTO_APPLIED, REJECTED

    @ManyToOne
    @JoinColumn(name = "actor_user_id")
    private AppUser actor;

    @Lob
    private String notes;

    private Instant occurredAt = Instant.now();
}
