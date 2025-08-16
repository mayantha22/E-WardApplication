package com.example.E_WardApplication.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ChangeRequestDTO {
    private Long id;
    private Long fromStaffId;
    private Long toStaffId;
    private LocalDate dutyDate;
    private String status; // PENDING, APPROVED, REJECTED
}
