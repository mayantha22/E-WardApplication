package com.example.E_WardApplication.repository;

import java.util.List;
import java.util.Optional;

import com.example.E_WardApplication.entity.staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<staff, Long> {

    List<staff> findByUser_FullNameContainingIgnoreCase(String keyword);
    Optional<staff> findByUser_Id(Long userId); // ✅ new query method

}
