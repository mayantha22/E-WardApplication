package com.example.E_WardApplication.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EquipmentInventoryDTO {
    private Long id;
    private String name;
    private int stock;
    private int threshold;
    private LocalDate lastUpdated;
}
