package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.UserDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDTO createUser(UserDTO dto) {
        AppUser u = AppUser.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .role(AppUser.Role.valueOf(dto.getRole()))
                .createdAt(Instant.now())
                .build();
        AppUser saved = repository.save(u);
        return toDto(saved);
    }

    @Override
    public Optional<UserDTO> findByUsername(String username) {
        return repository.findByUsername(username).map(this::toDto);
    }

    @Override
    public UserDTO getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserDTO toDto(AppUser u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole() != null ? u.getRole().name() : null);
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

}
