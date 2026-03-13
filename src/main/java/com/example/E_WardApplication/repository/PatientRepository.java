package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient , Long> {

}


