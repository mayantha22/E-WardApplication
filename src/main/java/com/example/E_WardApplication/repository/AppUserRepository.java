package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser , Long> {
}
