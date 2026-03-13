package com.example.E_WardApplication.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PatientDTO {

    private Long id;
    private String medicalRecordNumber;
    private String fullName;
    private String nic;
    private String contact;
    private String address;
    private LocalDate admissionDate;
    private LocalDate dischargeDate;
    private String assignedWard;
    private String status;
    private String notes;

    // Optional Fields for Future Functionality
    private Long assignedStaffId; // ID of the staff member assigned to the patient
    private List<String> medicines; // List of medicine names/IDs
    private List<String> meals; // List of meal names/IDs


}
