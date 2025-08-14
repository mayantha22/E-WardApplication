package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "equipment_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class EquipmentInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String serialNumber;
    private int quantity;
    private int threshold;
    private String location;

    private Instant lastUpdated = Instant.now();
}
