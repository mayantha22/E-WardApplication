package com.example.E_WardApplication.dto;

import lombok.Data;

@Data
public class staffDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String employeeNumber;
    private String phone;
    private String designation;
    private String ward;
    private int leaveCount;
    private int nightDutyCount;
}
