package com.example.E_WardApplication.repository;

import com.example.E_WardApplication.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser , Long> {

    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByResetPasswordToken(String token);
    List<AppUser> findByRole(AppUser.Role role);
}
