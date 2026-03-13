package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.UserDTO;

import java.util.Optional;

public interface UserService {
    UserDTO createUser(UserDTO dto);
    Optional<UserDTO> findByUsername(String username);
    UserDTO getById(Long id);
    void initiatePasswordReset(String email);
    void completePasswordReset(String token, String newPassword);
}

//STRING , INT ,DOU[