package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.ChangeRequestDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.entity.ChangeRequest;
import com.example.E_WardApplication.entity.staff;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.repository.ChangeRequestRepository;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.ChangeRequestService;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChangeRequestServiceImpl implements ChangeRequestService {

    private final ChangeRequestRepository repository;
    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    @Override
    public ChangeRequestDTO create(ChangeRequestDTO dto) {
        staff from = staffRepository.findById(dto.getFromStaffId()).orElseThrow(() -> new RuntimeException("From staff not found"));
        staff to = staffRepository.findById(dto.getToStaffId()).orElseThrow(() -> new RuntimeException("To staff not found"));

        ChangeRequest cr = ChangeRequest.builder()
                .fromStaff(from)
                .toStaff(to)
                .requestedShiftDate(dto.getRequestedShiftDate())
                .reason(dto.getReason())
                .status("PENDING")
                .requestDate(Instant.now())
                .requestType("ADMIN_APPROVAL") // <<< minimal additive field set
                .build();

        ChangeRequest saved = repository.save(cr);

        // notify ward master(s) — for simplicity notify all admins
        notificationService.createNotificationForRole("ADMIN", "New duty change request from " + from.getUser().getFullName(), "DUTY_CHANGE_REQUEST");

        return toDto(saved);
    }

    @Override
    public ChangeRequestDTO getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Change request not found"));
    }

    @Override
    public List<ChangeRequestDTO> getAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ChangeRequestDTO approve(Long id, Long approverUserId) {
        ChangeRequest cr = repository.findById(id).orElseThrow(() -> new RuntimeException("Change request not found"));
        cr.setStatus("APPROVED");
        cr.setDecisionDate(Instant.now());
        AppUser approver = appUserRepository.findById(approverUserId).orElse(null);
        cr.setDecidedBy(approver);
        ChangeRequest saved = repository.save(cr);

        // Notify both staff
        notificationService.createNotification(cr.getFromStaff().getUser().getId(), "Your duty change request was APPROVED", "DUTY_CHANGE_DECISION");
        notificationService.createNotification(cr.getToStaff().getUser().getId(), "Duty change request involving you was APPROVED", "DUTY_CHANGE_DECISION");

        // Optionally: update-duty roster data to reflect the swap. Left as manual or separate enhancement.

        return toDto(saved);
    }

    @Override
    public ChangeRequestDTO reject(Long id, Long approverUserId) {
        ChangeRequest cr = repository.findById(id).orElseThrow(() -> new RuntimeException("Change request not found"));
        cr.setStatus("REJECTED");
        cr.setDecisionDate(Instant.now());
        AppUser approver = appUserRepository.findById(approverUserId).orElse(null);
        cr.setDecidedBy(approver);
        ChangeRequest saved = repository.save(cr);

        // Notify requester
        notificationService.createNotification(cr.getFromStaff().getUser().getId(), "Your duty change request was REJECTED", "DUTY_CHANGE_DECISION");

        return toDto(saved);
    }

    private ChangeRequestDTO toDto(ChangeRequest cr) {
        ChangeRequestDTO dto = new ChangeRequestDTO();
        dto.setId(cr.getId());
        dto.setFromStaffId(cr.getFromStaff().getId());
        dto.setToStaffId(cr.getToStaff().getId());
        dto.setRequestDate(cr.getRequestDate());
        dto.setRequestedShiftDate(cr.getRequestedShiftDate());
        dto.setReason(cr.getReason());
        dto.setStatus(cr.getStatus());
        dto.setDecisionDate(cr.getDecisionDate());
        dto.setCreatedAt(cr.getCreatedAt());
        dto.setDecidedById(cr.getDecidedBy() != null ? cr.getDecidedBy().getId() : null);
        return dto;
    }
}
