package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
public class ChangeRequestDTO {
    private Long id;
    private Long fromStaffId;
    private Long toStaffId;
    private Instant requestDate;
    private LocalDate requestedShiftDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private Instant decisionDate;
    private Long decidedById;
    private Instant createdAt;
}
