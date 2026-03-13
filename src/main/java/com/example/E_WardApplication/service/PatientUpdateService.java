package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.PatientUpdateDTO;
import com.example.E_WardApplication.dto.PatientUpdateRequestDTO;

import java.util.List;

public interface PatientUpdateService {

    PatientUpdateDTO addUpdate(Long patientId, PatientUpdateRequestDTO requestDTO);

    List<PatientUpdateDTO> getUpdatesForPatient(Long patientId);
}
