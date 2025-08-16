package com.example.E_WardApplication.dto;

import lombok.Data;
import java.util.List;

@Data
public class PatientUpdateDTO {
    private Long id;
    private String currentStatus;
    private List<String> medicines;
    private List<String> meals;
}
