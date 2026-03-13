package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.PatientUpdateDTO;
import com.example.E_WardApplication.dto.PatientUpdateRequestDTO;
import com.example.E_WardApplication.service.PatientUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/patients/{patientId}/updates")
@RequiredArgsConstructor
public class PatientUpdateController {

    private final PatientUpdateService patientUpdateService;

    @PostMapping
    public PatientUpdateDTO addUpdate(
            @PathVariable Long patientId,
            @RequestBody PatientUpdateRequestDTO requestDTO) {
        return patientUpdateService.addUpdate(patientId, requestDTO);
    }

    @GetMapping
    public List<PatientUpdateDTO> getUpdates(@PathVariable Long patientId) {
        return patientUpdateService.getUpdatesForPatient(patientId);
    }
}
