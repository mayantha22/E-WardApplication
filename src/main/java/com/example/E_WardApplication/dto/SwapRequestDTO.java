package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Data
public class SwapRequestDTO {
    private Long id;
    private String requestType;

    private Long requesterStaffId;
    private String requesterName;

    private Long targetStaffId;
    private String targetName;

    private LocalDate originalShiftDate;
    private String originalShift;
    //TARGET SHIFTS
    private LocalDate requestedShiftDate;
    private String requestedShift;
    private String peerApprovalStatus;
    private String adminStatus;
    private String reason;
    private Map<String, Object> requestMeta;
    private Instant createdAt;
    private Instant updatedAt;
}
