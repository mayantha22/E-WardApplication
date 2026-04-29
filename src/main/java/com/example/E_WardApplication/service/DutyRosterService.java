package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.DutyRosterDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DutyRosterService {

    DutyRosterDTO create(DutyRosterDTO dto);
    DutyRosterDTO update(Long id, DutyRosterDTO dto);
    DutyRosterDTO getById(Long id);
    List<DutyRosterDTO> getAll();
    void delete(Long id);
    boolean staffHasSlot(Long staffId, LocalDate date, String shift);
    List<Map<String, String>> findSlotsForStaffInMonth(Long staffId, int month, int year);
    List<Map<String, String>> findSlotsForStaffInRoster(Long staffId, Long rosterId);


}
