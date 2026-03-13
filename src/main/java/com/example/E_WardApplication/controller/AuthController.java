package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.UserDTO;
import com.example.E_WardApplication.security.JwtTokenProvider;
import com.example.E_WardApplication.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;


    // For bootstrapping - create admin/user (in production restrict this)
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO dto) {
        UserDTO created = userService.createUser(dto);
        return ResponseEntity.ok(created);
    }
    // Authentication (login) will be handled by Security components (JWT). Here we provide the registration endpoint.

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            //USE SPRING SECURITY
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            //Generate token
            String token = jwtTokenProvider.generateToken(username);

            //get user details
            UserDTO user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));


            // Send both token and user to frontend
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", user
            ));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgot(@RequestBody Map<String, String> body) {
        userService.initiatePasswordReset(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> body) {
        userService.completePasswordReset(body.get("token"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

}


