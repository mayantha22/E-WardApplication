package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.DirectSwapCreateDTO;
import com.example.E_WardApplication.dto.SwapRequestDTO;

import java.time.LocalDate;
import java.util.List;

public interface SwapRequestService {
    SwapRequestDTO createDirectSwap(DirectSwapCreateDTO dto);
    SwapRequestDTO createAdminDirectSwap(DirectSwapCreateDTO dto);
    SwapRequestDTO createIndirectSwap(DirectSwapCreateDTO dto);

    SwapRequestDTO approvePeer(Long swapRequestId, Long approverUserId);
    SwapRequestDTO rejectByPeer(Long swapRequestId, Long approverUserId);
    SwapRequestDTO approveByAdmin(Long swapRequestId, Long approverUserId);
    SwapRequestDTO rejectByAdmin(Long swapRequestId, Long approverUserId);

    List<SwapRequestDTO> getAllFiltered(Long userId, String role);


    //add indirect approvel rejevtion service

    SwapRequestDTO getById(Long id);
    List<SwapRequestDTO> getAll();

    SwapRequestDTO assignIndirectSlot(Long swapRequestId, LocalDate requestedShiftDate, String requestedShift, Long targetStaffId);
}
