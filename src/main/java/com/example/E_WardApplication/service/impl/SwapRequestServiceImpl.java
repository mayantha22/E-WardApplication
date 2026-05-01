package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.DirectSwapCreateDTO;
import com.example.E_WardApplication.dto.SwapRequestDTO;
import com.example.E_WardApplication.entity.*;
import com.example.E_WardApplication.repository.*;
import com.example.E_WardApplication.service.DutyRosterService;
import com.example.E_WardApplication.service.SwapRequestService;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SwapRequestServiceImpl implements SwapRequestService {

    private final SwapRequestRepository swapRepo;
    private final SwapAuditLogRepository auditRepo;
    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;
    private final DutyRosterRepository rosterRepository;
    private final NotificationService notificationService;
    //NEW
    private final DutyRosterService dutyRosterService;

    //CREATESWAP
    @Override
    public SwapRequestDTO createDirectSwap(DirectSwapCreateDTO dto) {
        staff requester = staffRepository.findById(dto.getRequesterStaffId()).orElseThrow(() -> new RuntimeException("Requester not found"));
        staff target = staffRepository.findById(dto.getTargetStaffId()).orElseThrow(() -> new RuntimeException("Target not found"));


        SwapRequest sr = SwapRequest.builder()
                .requestType("DIRECT")
                .requesterStaff(requester)
                .targetStaff(target)
                .originalShiftDate(dto.getOriginalShiftDate())
                .originalShift(dto.getOriginalShift())
                .requestedShiftDate(dto.getRequestedShiftDate())
                .requestedShift(dto.getRequestedShift())
                .peerApprovalStatus("PENDING")
                .adminStatus("PENDING")
                .reason(dto.getReason())
                .requestMeta(dto.getRequestMeta())
                .build();

        SwapRequest saved = swapRepo.save(sr);
        auditRepo.save(buildAudit(saved, "CREATED", requester.getUser().getId(), "Direct swap requested"));

        notificationService.createNotification(target.getUser().getId(), "Swap request from " + requester.getUser().getFullName(), "SWAP_REQUEST");

        return toDto(saved);
    }

    //CREATEREQUESTING TO ADMIN SWAP
    @Override
    public SwapRequestDTO  createAdminDirectSwap(DirectSwapCreateDTO dto) {
        staff requester = staffRepository.findById(dto.getRequesterStaffId()).orElseThrow(() -> new RuntimeException("Requester not found"));
        staff target = staffRepository.findById(dto.getTargetStaffId()).orElseThrow(() -> new RuntimeException("Target not found"));

        SwapRequest sr = SwapRequest.builder()
                 .requestType("ADMIN_DIRECT")
                .requesterStaff(requester)
                .targetStaff(target)
                .originalShiftDate(dto.getOriginalShiftDate())
                .originalShift(dto.getOriginalShift())
                .requestedShiftDate(dto.getRequestedShiftDate())
                .requestedShift(dto.getRequestedShift())
                .peerApprovalStatus("NOT_REQUIRED")
                .adminStatus("PENDING")
                .reason(dto.getReason())
                .requestMeta(dto.getRequestMeta())
                .build();

        SwapRequest saved = swapRepo.save(sr);
        auditRepo.save(buildAudit(saved, "CREATED", requester.getUser().getId(), "Admin-directed swap"));

        notificationService.createNotificationForRole("ADMIN", "New admin-directed swap request", "SWAP_REQUEST");

        return toDto(saved);
    }

    @Override
    public SwapRequestDTO createIndirectSwap(DirectSwapCreateDTO dto) {
        staff requester = staffRepository.findById(dto.getRequesterStaffId())
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        SwapRequest sr = SwapRequest.builder()
                .requestType("INDIRECT")
                .requesterStaff(requester)
                .targetStaff(null)
                .originalShiftDate(dto.getOriginalShiftDate())
                .originalShift(dto.getOriginalShift())
                .requestedShiftDate(null)  // not used for indirect
                .requestedShift(null)      // not used for indirect
                .peerApprovalStatus("NOT_REQUIRED")
                .adminStatus("PENDING")
                .reason(dto.getReason())
                .requestMeta(dto.getRequestMeta()) // preferred slots stored here
                .build();

        SwapRequest saved = swapRepo.save(sr);
        auditRepo.save(buildAudit(saved, "CREATED", requester.getUser().getId(), "Indirect swap request"));
        notificationService.createNotificationForRole("ADMIN", "Indirect swap request awaiting allocation", "SWAP_REQUEST");
        return toDto(saved);
    }

    @Override
    public List<SwapRequestDTO> getAllFiltered(Long userId, String role) {
        List<SwapRequest> all = swapRepo.findAll();

        if ("ADMIN".equals(role)) {
            // Admins see: INDIRECT, ADMIN_DIRECT, and DIRECTs that are already Peer-Approved
            return all.stream()
                    .filter(sr -> "INDIRECT".equals(sr.getRequestType()) ||
                            "ADMIN_DIRECT".equals(sr.getRequestType()) ||
                            ("DIRECT".equals(sr.getRequestType()) && "APPROVED".equals(sr.getPeerApprovalStatus())))
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } else if (userId != null) {
            // Staff see: Anything they requested OR anything where they are the target
            return all.stream()
                    .filter(sr -> sr.getRequesterStaff().getUser().getId().equals(userId) ||
                            (sr.getTargetStaff() != null && sr.getTargetStaff().getUser().getId().equals(userId)))
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    //direct rq approvel
    @Override
    public SwapRequestDTO approvePeer(Long swapRequestId, Long approverUserId) {
        SwapRequest sr = swapRepo.findById(swapRequestId).orElseThrow(() -> new RuntimeException("Swap request not found"));
        if (!"DIRECT".equals(sr.getRequestType())) {
            throw new RuntimeException("Peer approval only valid for DIRECT requests");
        }
        sr.setPeerApprovalStatus("APPROVED");
        auditRepo.save(buildAudit(sr, "PEER_APPROVED", approverUserId, "Peer approved"));

        // Auto-apply with duplicate check
        try {
            applySwapToRoster(sr);
        } catch (RuntimeException e) {
            throw new RuntimeException("Swap blocked: " + e.getMessage());
        }

        // Auto-apply
        // applySwapToRoster(sr);
        sr.setAdminStatus("AUTO_APPLIED");
        SwapRequest saved = swapRepo.save(sr);

        notificationService.createNotification(sr.getRequesterStaff().getUser().getId(), "Your swap was peer-approved and applied", "SWAP_APPLIED");
        notificationService.createNotification(sr.getTargetStaff().getUser().getId(), "You approved a swap which has been applied", "SWAP_APPLIED");

        return toDto(saved);
    }

    //peer - reject
    @Override
    public SwapRequestDTO rejectByPeer(Long swapRequestId, Long approverUserId) {

        SwapRequest sr = swapRepo.findById(swapRequestId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));

        // --- BUSINESS RULES (can be extended later) ---
        sr.setPeerApprovalStatus("REJECTED");
        sr.setAdminStatus("REJECTED");

        auditRepo.save(
                buildAudit(sr, "PEER_REJECTED", approverUserId, "Peer rejected")
        );

        SwapRequest saved = swapRepo.save(sr);

        notificationService.createNotification(
                sr.getRequesterStaff().getUser().getId(),
                "Your swap request was rejected by peer",
                "SWAP_REJECTED"
        );

        return toDto(saved);
    }

    //admin rq approvel and reject
    @Override
    public SwapRequestDTO approveByAdmin(Long swapRequestId, Long approverUserId) {
        SwapRequest sr = swapRepo.findById(swapRequestId).orElseThrow(() -> new RuntimeException("Swap request not found"));
        sr.setAdminStatus("APPROVED");
        auditRepo.save(buildAudit(sr, "ADMIN_APPROVED", approverUserId, "Admin approved"));

        // Auto-apply with duplicate check
        try {
            applySwapToRoster(sr);
        } catch (RuntimeException e) {
            throw new RuntimeException("Swap blocked: " + e.getMessage());
        }

       // applySwapToRoster(sr);
        sr.setAdminStatus("AUTO_APPLIED");
        SwapRequest saved = swapRepo.save(sr);

        notificationService.createNotification(sr.getRequesterStaff().getUser().getId(), "Your swap request was approved and applied", "SWAP_APPLIED");
        if (sr.getTargetStaff() != null) {
            notificationService.createNotification(sr.getTargetStaff().getUser().getId(), "A swap request involving you was approved & applied", "SWAP_APPLIED");
        }

        return toDto(saved);
    }

    @Override
    public SwapRequestDTO rejectByAdmin(Long swapRequestId, Long approverUserId) {
        SwapRequest sr = swapRepo.findById(swapRequestId).orElseThrow(() -> new RuntimeException("Swap request not found"));
        sr.setAdminStatus("REJECTED");
        auditRepo.save(buildAudit(sr, "ADMIN_REJECTED", approverUserId, "Admin rejected"));
        SwapRequest saved = swapRepo.save(sr);

        notificationService.createNotification(sr.getRequesterStaff().getUser().getId(), "Your swap request was rejected", "SWAP_REJECTED");
        return toDto(saved);
    }

    private SwapAuditLog buildAudit(SwapRequest sr, String action, Long actorUserId, String notes) {
        AppUser actor = actorUserId == null ? null : appUserRepository.findById(actorUserId).orElse(null);
        return SwapAuditLog.builder()
                .swapRequest(sr)
                .action(action)
                .actor(actor)
                .notes(notes)
                .build();
    }

    private SwapRequestDTO toDto(SwapRequest sr) {
        SwapRequestDTO dto = new SwapRequestDTO();
        dto.setId(sr.getId());
        dto.setRequestType(sr.getRequestType());

        // 1. Handle Requester Name (Staff -> User -> FullName)
        dto.setRequesterStaffId(sr.getRequesterStaff().getId());
        if (sr.getRequesterStaff().getUser() != null) {
            dto.setRequesterName(sr.getRequesterStaff().getUser().getFullName());
        }

        // 2. Handle Target Name (Safe null check for INDIRECT swaps)
        if (sr.getTargetStaff() != null) {
            dto.setTargetStaffId(sr.getTargetStaff().getId());
            if (sr.getTargetStaff().getUser() != null) {
                dto.setTargetName(sr.getTargetStaff().getUser().getFullName());
            }
        }

        dto.setOriginalShiftDate(sr.getOriginalShiftDate());
        dto.setOriginalShift(sr.getOriginalShift());
        dto.setRequestedShiftDate(sr.getRequestedShiftDate());
        dto.setRequestedShift(sr.getRequestedShift());
        dto.setPeerApprovalStatus(sr.getPeerApprovalStatus());
        dto.setAdminStatus(sr.getAdminStatus());
        dto.setReason(sr.getReason());
        dto.setRequestMeta(sr.getRequestMeta());
        dto.setCreatedAt(sr.getCreatedAt());
        dto.setUpdatedAt(sr.getUpdatedAt());
        return dto;
    }

//    private SwapRequestDTO toDto(SwapRequest sr) {
//        SwapRequestDTO dto = new SwapRequestDTO();
//        dto.setId(sr.getId());
//        dto.setRequestType(sr.getRequestType());
//        dto.setRequesterStaffId(sr.getRequesterStaff().getId());
//        dto.setTargetStaffId(sr.getTargetStaff() != null ? sr.getTargetStaff().getId() : null);
//        dto.setOriginalShiftDate(sr.getOriginalShiftDate());
//        dto.setOriginalShift(sr.getOriginalShift());
//        dto.setRequestedShiftDate(sr.getRequestedShiftDate());
//        dto.setRequestedShift(sr.getRequestedShift());
//        dto.setPeerApprovalStatus(sr.getPeerApprovalStatus());
//        dto.setAdminStatus(sr.getAdminStatus());
//        dto.setReason(sr.getReason());
//        dto.setRequestMeta(sr.getRequestMeta());
//        dto.setCreatedAt(sr.getCreatedAt());
//        dto.setUpdatedAt(sr.getUpdatedAt());
//        return dto;
//    }

    //    private void applySwapToRoster(SwapRequest sr) {
//
//        LocalDate date1 = sr.getOriginalShiftDate();
//        LocalDate date2 = sr.getRequestedShiftDate();
//
//        int month = date1.getMonthValue();
//        int year = date1.getYear();
//
//        List<DutyRoster> rosters = rosterRepository.findAll().stream()
//                .filter(r -> r.getMonth() == month && r.getYear() == year)
//                .collect(Collectors.toList());
//
//        for (DutyRoster roster : rosters) {
//
//            Map<String, Object> data = roster.getData();
//            if (data == null) continue;
//
//            String key1 = date1.toString();
//            String key2 = date2.toString();
//
//            if (!data.containsKey(key1) || !data.containsKey(key2)) continue;
//
//            Map<String, Object> shifts1 = (Map<String, Object>) data.get(key1);
//            Map<String, Object> shifts2 = (Map<String, Object>) data.get(key2);
//
//            if (shifts1 == null || shifts2 == null) continue;
//
//            // REMOVE requester from original shift
//            removeStaffFromShift(shifts1, sr.getOriginalShift(), sr.getRequesterStaff().getId());
//
//            // If target exists → two-way swap
//            if (sr.getTargetStaff() != null) {
//                removeStaffFromShift(shifts2, sr.getRequestedShift(), sr.getTargetStaff().getId());
//
//                addStaffToShift(shifts1, sr.getOriginalShift(), sr.getTargetStaff());
//                addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
//            }
//            else {
//                // INDIRECT or ADMIN_DIRECT with no target swap back
//                addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
//            }
//
//            roster.setData(data);
//            rosterRepository.save(roster);
//
//            auditRepo.save(buildAudit(sr, "AUTO_APPLIED", null,
//                    "Applied to roster id=" + roster.getId()));
//
//            return;
//        }
//
//        throw new RuntimeException("No matching roster found to apply swap");
//    }

//    @SuppressWarnings({"unchecked", "unchecked"})
//    private void applySwapToRoster(SwapRequest sr) {
//        LocalDate date1 = sr.getOriginalShiftDate();
//        LocalDate date2 = sr.getRequestedShiftDate();
//
//        // Find roster for the specific month/year
//        DutyRoster roster = rosterRepository.findAll().stream()
//                .filter(r -> r.getMonth() == date1.getMonthValue() && r.getYear() == date1.getYear())
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("No matching roster found for " + date1.getMonthValue()));
//
//        // CLONE the data map to force Hibernate to see the change
//        Map<String, Object> data = new HashMap<>(roster.getData());
//
//        String key1 = date1.toString();
//        String key2 = date2.toString();
//
//        // Ensure shifts exist in the roster data
//        Map<String, Object> shifts1 = new HashMap<>((Map<String, Object>) data.get(key1));
//        Map<String, Object> shifts2 = new HashMap<>((Map<String, Object>) data.get(key2));
//
//        // 1. Remove requester from original
//        removeStaffFromShift(shifts1, sr.getOriginalShift(), sr.getRequesterStaff().getId());
//
//        // 2. Handle Two-Way vs One-Way
//        if (sr.getTargetStaff() != null) {
//            removeStaffFromShift(shifts2, sr.getRequestedShift(), sr.getTargetStaff().getId());
//            addStaffToShift(shifts1, sr.getOriginalShift(), sr.getTargetStaff());
//            addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
//        } else {
//            addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
//        }
//
//        // 3. Put back into data map
//        data.put(key1, shifts1);
//        data.put(key2, shifts2);
//
//        // 4. Force Save
//        roster.setData(data);
//        rosterRepository.saveAndFlush(roster); // Flush ensures it hits DB immediately
//    }

//

    private void applySwapToRoster(SwapRequest sr) {
        LocalDate date1 = sr.getOriginalShiftDate();
        LocalDate date2 = sr.getRequestedShiftDate();

        DutyRoster roster = rosterRepository.findAll().stream()
                .filter(r -> r.getMonth() == date1.getMonthValue() && r.getYear() == date1.getYear())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No matching roster found"));

        Map<String, Object> data = new HashMap<>(roster.getData());
        String key1 = date1.toString();
        String key2 = date2.toString();

        boolean sameDay = key1.equals(key2);

        // ✅ If same day, use ONE shared map — not two separate copies
        Map<String, Object> shifts1 = new HashMap<>((Map<String, Object>) data.get(key1));
        Map<String, Object> shifts2 = sameDay ? shifts1 : new HashMap<>((Map<String, Object>) data.get(key2));

        if (sr.getTargetStaff() != null) {
            removeStaffFromShift(shifts1, sr.getOriginalShift(), sr.getRequesterStaff().getId());
            removeStaffFromShift(shifts2, sr.getRequestedShift(), sr.getTargetStaff().getId());
            addStaffToShift(shifts1, sr.getOriginalShift(), sr.getTargetStaff());
            addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
        } else {
            removeStaffFromShift(shifts1, sr.getOriginalShift(), sr.getRequesterStaff().getId());
            addStaffToShift(shifts2, sr.getRequestedShift(), sr.getRequesterStaff());
        }

        data.put(key1, shifts1);
        if (!sameDay) data.put(key2, shifts2);

        roster.setData(null);
        roster.setData(data);
        rosterRepository.saveAndFlush(roster);

        auditRepo.save(buildAudit(sr, "AUTO_APPLIED", null, "Applied to roster id=" + roster.getId()));
    }

    @SuppressWarnings("unchecked")
    private void removeStaffFromShift(Map<String, Object> shifts, String shiftName, Long staffId) {
        String key = shiftName.toLowerCase();
        List<Map<String, Object>> list = (List<Map<String, Object>>) shifts.getOrDefault(key, new ArrayList<>());
        List<Map<String, Object>> filtered = list.stream()
                .filter(m -> {
                    Object idObj = m.get("id");
                    if (idObj instanceof Integer) {
                        return !Objects.equals(((Integer) idObj).longValue(), staffId);
                    } else if (idObj instanceof Long) {
                        return !Objects.equals((Long) idObj, staffId);
                    }
                    return true;
                })
                .collect(Collectors.toList());
        shifts.put(key, filtered);
    }

    private void addStaffToShift(Map<String, Object> shifts, String shiftName, staff s) {
        String key = shiftName.toLowerCase();
        List<Map<String, Object>> list = (List<Map<String, Object>>) shifts.getOrDefault(key, new ArrayList<>());
        Map<String, Object> entry = new HashMap<>();
        entry.put("id", s.getId().intValue());
        entry.put("name", s.getUser().getFullName());
        list.add(entry);
        shifts.put(key, list);
    }

    @Override
    public SwapRequestDTO getById(Long id) {
        return swapRepo.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Swap request not found"));
    }

    @Override
    public List<SwapRequestDTO> getAll() {
        return swapRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SwapRequestDTO assignIndirectSlot(Long swapRequestId, LocalDate requestedShiftDate, String requestedShift, Long targetStaffId) {
        SwapRequest sr = swapRepo.findById(swapRequestId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));

        if (!"INDIRECT".equals(sr.getRequestType())) {
            throw new RuntimeException("This is not an indirect swap request");
        }

        sr.setRequestedShiftDate(requestedShiftDate);
        sr.setRequestedShift(requestedShift);

        if (targetStaffId != null) {
            staff target = staffRepository.findById(targetStaffId)
                    .orElseThrow(() -> new RuntimeException("Target staff not found"));
            sr.setTargetStaff(target);
        }

        SwapRequest saved = swapRepo.save(sr);
        auditRepo.save(buildAudit(saved, "INDIRECT_ASSIGNED", null,
                "Admin assigned slot: " + requestedShiftDate + " " + requestedShift));

        return toDto(saved);
    }
}
