package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.service.impl.PatientReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientReportController {

    private final PatientReportService patientReportService;

    @GetMapping("/{patientId}/report")
    public ResponseEntity<byte[]> getPatientReport(@PathVariable Long patientId) {
        byte[] pdfBytes = patientReportService.generatePatientReport(patientId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=patient_report_" + patientId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }
}
