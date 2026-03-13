package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.PatientUpdateDTO;
import com.example.E_WardApplication.dto.PatientUpdateRequestDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.entity.Patient;
import com.example.E_WardApplication.entity.PatientUpdate;
import com.example.E_WardApplication.entity.staff;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.repository.PatientRepository;
import com.example.E_WardApplication.repository.PatientUpdateRepository;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.PatientUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientUpdateServiceImpl implements PatientUpdateService {

    private final PatientRepository patientRepository;
    private final PatientUpdateRepository patientUpdateRepository;
    //private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;

//



    @Override
    public PatientUpdateDTO addUpdate(Long patientId, PatientUpdateRequestDTO requestDTO) {
        // find the patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // get logged-in username
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // load AppUser by username
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("AppUser not found"));

        // build PatientUpdate
        PatientUpdate update = PatientUpdate.builder()
                .patient(patient)
                .summary(requestDTO.getSummary())
                .recordedBy(appUser)
                .build();

        PatientUpdate savedUpdate = patientUpdateRepository.save(update);
        return toDTO(savedUpdate);
        //return patientUpdateRepository.save(update);
    }


    @Override
    public List<PatientUpdateDTO> getUpdatesForPatient(Long patientId) {
        return patientUpdateRepository.findAll().stream()
                .filter(update -> update.getPatient().getId().equals(patientId))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PatientUpdateDTO toDTO(PatientUpdate update) {
        return PatientUpdateDTO.builder()
                .id(update.getId())
                .patientId(update.getPatient().getId())
                .updateDate(update.getUpdateDate())
                .summary(update.getSummary())
                .recordedById(update.getRecordedBy() != null ? update.getRecordedBy().getId() : null)
                .recordedByName(update.getRecordedBy() != null ? update.getRecordedBy().getUsername() : null) // ✅ username
                .createdAt(update.getCreatedAt())
                .build();
    }
}
