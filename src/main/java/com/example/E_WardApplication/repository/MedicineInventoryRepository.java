package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.MedicineInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineInventoryRepository extends JpaRepository<MedicineInventory , Long> {
}

