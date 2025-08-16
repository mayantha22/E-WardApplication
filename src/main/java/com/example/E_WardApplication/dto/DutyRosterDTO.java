package com.example.E_WardApplication.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.Map;

@Data
public class DutyRosterDTO {
    private Long id;
    private int month;
    private int year;
    // Map of date to staff ID
    private Map<LocalDate, Long> assignments;
}
