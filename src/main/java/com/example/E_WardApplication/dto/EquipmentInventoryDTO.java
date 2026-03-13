package com.example.E_WardApplication.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
public class EquipmentInventoryDTO {
    private Long id;
    private String name;
    private String serialNumber;
    private int quantity;
    private int threshold;
    private String location;

    private Instant lastUpdated = Instant.now();

}
