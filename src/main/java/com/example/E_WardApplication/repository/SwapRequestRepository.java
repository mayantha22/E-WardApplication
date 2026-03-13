package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {
    List<SwapRequest> findByRequesterStaffId(Long staffId);
    List<SwapRequest> findByTargetStaffId(Long staffId);
    List<SwapRequest> findByAdminStatus(String status);
}
