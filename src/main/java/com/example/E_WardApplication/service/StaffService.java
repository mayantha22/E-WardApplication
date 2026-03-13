package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.staffDTO;

import java.util.List;

public interface StaffService {
    staffDTO createStaff(staffDTO dto);
    staffDTO updateStaff(Long id, staffDTO dto);
    staffDTO getStaffById(Long id);
    List<staffDTO> getAllStaff();
    void deleteStaff(Long id);
    staffDTO getByUserId(Long userId); // ✅ newly added
}
