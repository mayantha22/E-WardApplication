package com.example.E_WardApplication.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PatientDTO {

    private Long id;
    private String name;
    private String contact;
    private LocalDate admissionDate;
    private String assignedWard;
    private Long assignedStaffId;
    private List<String> medicines;
    private List<String> meals;
    private String currentStatus;

}
