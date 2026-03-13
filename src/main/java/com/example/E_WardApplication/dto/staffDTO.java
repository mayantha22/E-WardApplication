package com.example.E_WardApplication.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;

@Data
public class staffDTO {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String employeeNumber;
    private String phone;
    private String address;
    private String designation;
    private String ward;
    private int leaveCount;
    private int nightDutyCount;
    private String generatedUsername;
    private String generatedPassword;
}
