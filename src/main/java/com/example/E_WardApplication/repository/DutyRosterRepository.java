package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.DrugTrolleyInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DutyRosterRepository extends JpaRepository<DrugTrolleyInventory , Long> {
}
