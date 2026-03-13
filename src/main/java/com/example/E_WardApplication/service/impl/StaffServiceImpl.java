package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.staffDTO;
import com.example.E_WardApplication.entity.*;
import com.example.E_WardApplication.repository.*;
import com.example.E_WardApplication.service.EmailService;
import com.example.E_WardApplication.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DutyRosterRepository dutyRosterRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PatientUpdateRepository patientUpdateRepository;


    @Override
    public staffDTO createStaff(staffDTO dto) {

        // 1. Generate username (firstname.lastname format + random digits)
        String baseUsername = dto.getFullName()
                .trim()
                .toLowerCase()
                .replaceAll("\\s+", ".");
        String username = baseUsername + RandomStringUtils.randomNumeric(3);

        // 2. Generate random password
        String rawPassword = RandomStringUtils.randomAlphanumeric(8);


        //create AppUser
        AppUser user = AppUser.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .role(AppUser.Role.valueOf("STAFF"))
                .build();

        AppUser savedUser = appUserRepository.save(user);

        staff s = staff.builder()
                .user(user)
                .employeeNumber(dto.getEmployeeNumber())
                .phone(dto.getPhone())
                .designation(dto.getDesignation())
                .ward(dto.getWard())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .leaveCount(dto.getLeaveCount())
                .nightDutyCount(dto.getNightDutyCount())
                .build();

        staff savedStaff = staffRepository.save(s);

        try {
            emailService.sendCredentials(savedStaff.getEmail(), username, rawPassword);
        } catch (Exception e) {
            // Log error but do not prevent staff creation
            System.err.println("Failed to send email to " + savedStaff.getEmail() + ": " + e.getMessage());
        }

        // 5. Return DTO with credentials (so admin can note it or send via email)
        staffDTO result = toDto(savedStaff);
        result.setGeneratedUsername(username);
        result.setGeneratedPassword(rawPassword); //

        return result;
    }

    @Override
    public staffDTO updateStaff(Long id, staffDTO dto) {
        staff s = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));

        // linked appuser attributes  to update
        AppUser user = s.getUser();
        if (user != null) {
            user.setFullName(dto.getFullName());
            user.setEmail(dto.getEmail());
            appUserRepository.save(user);
        }

        s.setEmployeeNumber(dto.getEmployeeNumber());
        s.setPhone(dto.getPhone());
        s.setDesignation(dto.getDesignation());
        s.setWard(dto.getWard());
        s.setAddress(dto.getAddress());
        s.setLeaveCount(dto.getLeaveCount());
        s.setNightDutyCount(dto.getNightDutyCount());

        //sync email on the staff entityy
        s.setEmail(dto.getEmail());

        staff saved = staffRepository.save(s);
        return toDto(saved);
    }

    @Override
    public staffDTO getStaffById(Long id) {
        return staffRepository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    @Override
    public List<staffDTO> getAllStaff() {
        return staffRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void  deleteStaff(Long id) {
        // 1. Find the staff member to get their IDs
        staff staffToDelete = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + id));

        final Long staffId = staffToDelete.getId();
        Long appUserId = staffToDelete.getUser().getId();

        //patientUpdate fk violation
        List<PatientUpdate> patientUpdates = patientUpdateRepository.findByRecordedById(appUserId);

        if (!patientUpdates.isEmpty()) {
            patientUpdateRepository.deleteAll(patientUpdates);
        }

        // Use the new, confirmed method: findByRecipientId
        List<Notification> userNotifications = notificationRepository.findByRecipientId(appUserId);
        if (!userNotifications.isEmpty()) {
            notificationRepository.deleteAll(userNotifications);
        }

        // Find and delete all associated ChangeRequest entries
        List<ChangeRequest> initiatedRequests = changeRequestRepository.findByFromStaffId(staffId);
        if (!initiatedRequests.isEmpty()) {
            changeRequestRepository.deleteAll(initiatedRequests);
        }

        // Find and delete all requests where the staff member is the recipient ('toStaff')
        List<ChangeRequest> targetedRequests = changeRequestRepository.findByToStaffId(staffId);
        if (!targetedRequests.isEmpty()) {
            changeRequestRepository.deleteAll(targetedRequests);
        }
        // 2. Clean up DutyRoster assignments (CRITICAL FIX for JSONB)
        List<DutyRoster> affectedRosters = dutyRosterRepository.findByStaffIdInRoster(staffId);

        for (DutyRoster roster : affectedRosters) {

            // The data structure is: Map<Date, Map<Shift, List<StaffAssignment>>>
            @SuppressWarnings("unchecked")
            Map<String, Object> datesMap = roster.getData();

            if (datesMap != null) {

                // Iterate through each date (e.g., "2025-11-01")
                datesMap.forEach((date, shiftsObj) -> {

                    if (shiftsObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> shiftsMap = (Map<String, Object>) shiftsObj;

                        // Iterate through each shift (e.g., "morning", "evening", "night")
                        shiftsMap.forEach((shift, assignmentsListObj) -> {

                            if (assignmentsListObj instanceof List) {
                                @SuppressWarnings("unchecked")
                                List<Map<String, Object>> assignmentsList = (List<Map<String, Object>>) assignmentsListObj;

                                // Remove the deleted staff member's assignment from the list
                                assignmentsList.removeIf(assignment -> {
                                    // The assignment is a Map: {"id": 2, "name": "..."}
                                    Object assignedId = assignment.get("id");

                                    // Check if the assigned ID matches the deleted staff ID
                                    return assignedId instanceof Number && ((Number) assignedId).longValue() == staffId;
                                });
                            }
                        });
                    }
                });
            }

            // Save the cleaned roster back to the database
            dutyRosterRepository.save(roster);
        }

        // 3. Delete the core records
        // This is wrapped in the @Transactional boundary, ensuring atomicity.
        staffRepository.delete(staffToDelete);

        // Assuming AppUser must also be deleted if staff is deleted
        appUserRepository.deleteById(appUserId);
    }

    private staffDTO toDto(staff s) {
        staffDTO dto = new staffDTO();
        dto.setId(s.getId());
        if (s.getUser() != null) {
            dto.setFullName(s.getUser().getFullName());
            dto.setEmail(s.getUser().getEmail());
            dto.setRole(s.getUser().getRole() != null ? s.getUser().getRole().name() : null);
        }
        dto.setEmployeeNumber(s.getEmployeeNumber());
        dto.setPhone(s.getPhone());
        dto.setDesignation(s.getDesignation());
        dto.setWard(s.getWard());
        dto.setAddress(s.getAddress());
        dto.setLeaveCount(s.getLeaveCount());
        dto.setNightDutyCount(s.getNightDutyCount());
        return dto;
    }

    // ✅ NEW
    @Override
    public staffDTO getByUserId(Long userId) {
        staff s = staffRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Staff not found for user ID: " + userId));
        return toDto(s);
    }
}


