package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;


@Entity
@Table(name = "medicine_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String batchNumber;
    private int quantity;
    private int threshold;
    private String location;

    private Instant lastUpdated = Instant.now();


}
