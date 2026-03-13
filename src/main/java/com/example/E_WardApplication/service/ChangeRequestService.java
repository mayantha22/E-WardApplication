package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.ChangeRequestDTO;

import java.util.List;

public interface ChangeRequestService {

    ChangeRequestDTO create(ChangeRequestDTO dto);
    ChangeRequestDTO getById(Long id);
    List<ChangeRequestDTO> getAll();
    ChangeRequestDTO approve(Long id, Long approverUserId);
    ChangeRequestDTO reject(Long id, Long approverUserId);

}
