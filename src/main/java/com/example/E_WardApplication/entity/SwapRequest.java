package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "swap_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requestType; // DIRECT, ADMIN_DIRECT, INDIRECT

    @ManyToOne
    @JoinColumn(name = "requester_staff_id", nullable = false)
    private staff requesterStaff;

    @ManyToOne
    @JoinColumn(name = "target_staff_id")
    private staff targetStaff; // nullable for INDIRECT

    private LocalDate originalShiftDate;
    private String originalShift; // MORNING / EVENING / NIGHT

    //TARGET SHIFTS
    private LocalDate requestedShiftDate;
    private String requestedShift;

    private String peerApprovalStatus; // NOT_REQUIRED, PENDING, APPROVED, REJECTED
    private String adminStatus; // PENDING, APPROVED, REJECTED, AUTO_APPLIED

    @Lob
    private String reason;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> requestMeta;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
