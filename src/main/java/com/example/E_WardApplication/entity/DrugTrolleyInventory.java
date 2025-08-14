package com.example.E_WardApplication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "drug_trolley_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugTrolleyInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String trolleyId;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private MedicineInventory medicine;

    private int quantity;
    private Instant lastUpdated = Instant.now();
}
