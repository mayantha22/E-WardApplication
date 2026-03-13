package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
public class MedicineInventoryDTO {
    private Long id;
    private String name;
    private String batchNumber;
    private int quantity;
    private int threshold;
    private String location;

    private Instant lastUpdated = Instant.now();
}
