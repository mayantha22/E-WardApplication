package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.PatientDTO;

import java.util.List;

public interface PatientService {
        PatientDTO createPatient(PatientDTO dto);
        PatientDTO updatePatient(Long id, PatientDTO dto);
        PatientDTO getPatientById(Long id);
        List<PatientDTO> getAllPatients();
        void deletePatient(Long id);

        PatientDTO transferPatient(Long patientId, String targetWard, Long performedByUserId);
    }

