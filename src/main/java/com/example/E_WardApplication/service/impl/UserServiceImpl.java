package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.UserDTO;
import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.repository.AppUserRepository;
import com.example.E_WardApplication.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;



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

    @Override
    public void initiatePasswordReset(String email) {

        AppUser user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String token = UUID.randomUUID().toString();

        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(Instant.now().plusSeconds(900)); // 15 minutes

        repository.save(user);

        sendResetEmail(user.getEmail(), token);
    }

    private void sendResetEmail(String email, String token) {

        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link: " + resetLink);

        mailSender.send(message);
    }

    @Override
    public void completePasswordReset(String token, String newPassword) {

        AppUser user = repository.findByResetPasswordToken(token)
                .filter(u -> u.getResetPasswordTokenExpiry() != null &&
                        u.getResetPasswordTokenExpiry().isAfter(Instant.now()))
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        repository.save(user);
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
