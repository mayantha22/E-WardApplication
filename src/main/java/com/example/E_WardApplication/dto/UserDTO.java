package com.example.E_WardApplication.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;

    private String role; // ADMIN, STAFF
    // needed for createUser()
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // needed for setCreatedAt()
    private Instant createdAt;
}
