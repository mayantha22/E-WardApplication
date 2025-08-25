package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.staffDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.entity.staff;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;

    @Override
    public staffDTO createStaff(staffDTO dto) {
        AppUser user = appUserRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Associated user not found. Provide user id in dto.id"));

        staff s = staff.builder()
                .user(user)
                .employeeNumber(dto.getEmployeeNumber())
                .phone(dto.getPhone())
                .designation(dto.getDesignation())
                .ward(dto.getWard())
                .leaveCount(dto.getLeaveCount())
                .nightDutyCount(dto.getNightDutyCount())
                .build();

        staff saved = staffRepository.save(s);
        return toDto(saved);
    }

    @Override
    public staffDTO updateStaff(Long id, staffDTO dto) {
        staff s = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));
        s.setEmployeeNumber(dto.getEmployeeNumber());
        s.setPhone(dto.getPhone());
        s.setDesignation(dto.getDesignation());
        s.setWard(dto.getWard());
        s.setLeaveCount(dto.getLeaveCount());
        s.setNightDutyCount(dto.getNightDutyCount());
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
    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
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
        dto.setLeaveCount(s.getLeaveCount());
        dto.setNightDutyCount(s.getNightDutyCount());
        return dto;
    }
}


