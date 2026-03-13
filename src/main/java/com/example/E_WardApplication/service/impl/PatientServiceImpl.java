package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.PatientDTO;
import com.example.E_WardApplication.entity.Patient;
import com.example.E_WardApplication.entity.PatientUpdate;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.repository.PatientRepository;
import com.example.E_WardApplication.repository.PatientUpdateRepository;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.NotificationService;
import com.example.E_WardApplication.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientUpdateRepository patientUpdateRepository;
    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    @Override
    public PatientDTO createPatient(PatientDTO dto) {
        Patient p = Patient.builder()
                .medicalRecordNumber(dto.getMedicalRecordNumber())
                .fullName(dto.getFullName())
                .nic(dto.getNic())
                .contact(dto.getContact())
                .address(dto.getAddress())
                .admissionDate(Instant.now())
                .assignedWard(dto.getAssignedWard())
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .build();
        Patient saved = patientRepository.save(p);
        return toDto(saved);
    }

    @Override
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient p = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
        p.setFullName(dto.getFullName());
        p.setNic(dto.getNic());
        p.setContact(dto.getContact());
        p.setAddress(dto.getAddress());
        p.setStatus(dto.getStatus());
        p.setNotes(dto.getNotes());
        p.setAssignedWard(dto.getAssignedWard());
        Patient saved = patientRepository.save(p);
        return toDto(saved);
    }

    @Override
    public PatientDTO getPatientById(Long id) {
        return patientRepository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    @Override
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }


    @Override
    public PatientDTO transferPatient(Long patientId, String targetWard, Long ignoredUserId) {
        Patient p = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        String previousWard = p.getAssignedWard();
        p.setAssignedWard(targetWard);
        Patient saved = patientRepository.save(p);

        // ✅ Get logged-in user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        var performedBy = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        // Create update entry
        PatientUpdate pu = PatientUpdate.builder()
                .patient(p)
                .summary("Transferred from ward: " + previousWard + " to: " + targetWard)
                .updateDate(Instant.now())
                .recordedBy(performedBy)
                .build();
        patientUpdateRepository.save(pu);

        // Send notification
        notificationService.createNotification(
                performedBy.getId(),
                "Patient " + p.getFullName() + " transferred to " + targetWard,
                "PATIENT_TRANSFER"
        );

        return toDto(saved);
    }


//    @Override
//    public PatientDTO transferPatient(Long patientId, String targetWard, Long performedByUserId) {
//        Patient p = patientRepository.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));
//        String previousWard = p.getAssignedWard();
//        p.setAssignedWard(targetWard);
//        Patient saved = patientRepository.save(p);
//
//        // Create a patient update record describing transfer
//        PatientUpdate pu = PatientUpdate.builder()
//                .patient(p)
//                .summary("Transferred from ward: " + previousWard + " to: " + targetWard)
//                .updateDate(Instant.now())
//                .build();
//        patientUpdateRepository.save(pu);
//
//        // Notify ward admin / performedBy user if exists
//        if (performedByUserId != null) {
//            appUserRepository.findById(performedByUserId).ifPresent(user -> {
//                notificationService.createNotification(user.getId(), "Patient " + p.getFullName() + " transferred to " + targetWard, "PATIENT_TRANSFER");
//            });
//        }
//
//        return toDto(saved);
//    }

    private PatientDTO toDto(Patient p) {
        PatientDTO dto = new PatientDTO();
        dto.setId(p.getId());
        dto.setMedicalRecordNumber(p.getMedicalRecordNumber());
        dto.setFullName(p.getFullName());
        dto.setNic(p.getNic());
        dto.setContact(p.getContact());
        dto.setAddress(p.getAddress());
        dto.setAssignedWard(p.getAssignedWard());
        dto.setStatus(p.getStatus());
        dto.setNotes(p.getNotes());

        //dto.setAdmissionDate(LocalDate.from(p.getAdmissionDate()));
        // ✅ Correct Instant → LocalDate conversion
        if (p.getAdmissionDate() != null) {
            dto.setAdmissionDate(
                    p.getAdmissionDate()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate()
            );
        }

        //dto.setDischargeDate(LocalDate.from(p.getDischargeDate()));
        if (p.getDischargeDate() != null) {
            dto.setDischargeDate(
                    p.getDischargeDate()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate()
            );
        }



        return dto;
        //this todto method we convert that entity into dto again


    }
}


