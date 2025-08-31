package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Data
public class DutyRosterDTO {
    private Long id;
    private int month;
    private int year;
    private String ward;
    private Map<String, Object> data; // JSON string, same as entity
    private Instant createdAt;
    // Map of date to staff ID

}
