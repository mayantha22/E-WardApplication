package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.PatientUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientUpdateRepository extends JpaRepository<PatientUpdate , Long> {
    List<PatientUpdate> findByRecordedById(Long userId);
}
