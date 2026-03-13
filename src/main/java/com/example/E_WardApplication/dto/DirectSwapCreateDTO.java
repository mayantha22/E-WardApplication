package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class DirectSwapCreateDTO {
    private Long requesterStaffId;
    private Long targetStaffId; // nullable for indirect calls
    private LocalDate originalShiftDate;
    private String originalShift;
    //TARGET SHIFTS
    private LocalDate requestedShiftDate;
    private String requestedShift;
    private String reason;
    private Map<String, Object> requestMeta;
}
