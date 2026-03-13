package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.entity.Patient;
import com.example.E_WardApplication.entity.PatientUpdate;
import com.example.E_WardApplication.repository.PatientRepository;
import com.example.E_WardApplication.repository.PatientUpdateRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientReportService {

    private final PatientRepository patientRepository;
    private final PatientUpdateRepository patientUpdateRepository;

    public byte[] generatePatientReport(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<PatientUpdate> updates = patientUpdateRepository.findAll().stream()
                .filter(u -> u.getPatient().getId().equals(patientId))
                .toList();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            document.add(new Paragraph("Patient Report", titleFont));
            document.add(new Paragraph(" "));

            // Patient info
            document.add(new Paragraph("Patient Name: " + patient.getFullName()));
            document.add(new Paragraph("Medical Record Number: " + patient.getMedicalRecordNumber()));
            document.add(new Paragraph("Assigned Ward: " + patient.getAssignedWard()));
            document.add(new Paragraph("Admission Date: " + patient.getAdmissionDate()));
            document.add(new Paragraph("Discharge Date: " + patient.getDischargeDate()));
            document.add(new Paragraph("Status: " + patient.getStatus()));
            document.add(new Paragraph("Notes: " + patient.getNotes()));
            document.add(new Paragraph(" "));

            // Updates
            Font subHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            document.add(new Paragraph("Daily Updates", subHeader));
            document.add(new Paragraph(" "));

            for (PatientUpdate update : updates) {
                document.add(new Paragraph("Date: " + update.getUpdateDate()));
                document.add(new Paragraph("Summary: " + update.getSummary()));
                document.add(new Paragraph("Recorded By: " +
                        (update.getRecordedBy() != null ? update.getRecordedBy().getFullName() : "N/A")));
                document.add(new Paragraph("____________"));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error while generating PDF report", e);
        }
    }
}
