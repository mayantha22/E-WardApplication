package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.SwapAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwapAuditLogRepository extends JpaRepository<SwapAuditLog, Long> {
    List<SwapAuditLog> findBySwapRequestId(Long swapRequestId);
}
