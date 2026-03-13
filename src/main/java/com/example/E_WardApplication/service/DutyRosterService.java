package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.DutyRosterDTO;

import java.util.List;

public interface DutyRosterService {

    DutyRosterDTO create(DutyRosterDTO dto);
    DutyRosterDTO update(Long id, DutyRosterDTO dto);
    DutyRosterDTO getById(Long id);
    List<DutyRosterDTO> getAll();
    void delete(Long id);

}
