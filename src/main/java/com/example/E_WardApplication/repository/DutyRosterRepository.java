package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.DrugTrolleyInventory;
import com.example.E_WardApplication.entity.DutyRoster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DutyRosterRepository extends JpaRepository<DutyRoster, Long> {

    @Query(value = "SELECT * FROM duty_roster WHERE data::text LIKE %?1%", nativeQuery = true)
    List<DutyRoster> findByStaffIdInRoster(Long staffId);
}
