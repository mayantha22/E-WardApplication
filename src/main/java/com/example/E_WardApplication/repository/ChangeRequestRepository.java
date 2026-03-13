package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest , Long> {
    // Find requests submitted by the staff member being deleted
    List<ChangeRequest> findByFromStaffId(Long staffId);

    // Find requests targeted at the staff member being deleted
    List<ChangeRequest> findByToStaffId(Long staffId);
}
