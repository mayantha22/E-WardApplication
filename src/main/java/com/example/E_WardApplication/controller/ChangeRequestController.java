package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.ChangeRequestDTO;
import com.example.E_WardApplication.service.ChangeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/change-requests")
@RequiredArgsConstructor
public class ChangeRequestController {

    private final ChangeRequestService service;

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping
    public ResponseEntity<ChangeRequestDTO> create(@RequestBody ChangeRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequestDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<ChangeRequestDTO>> list() {
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ChangeRequestDTO> approve(@PathVariable Long id, @RequestParam Long approverUserId) {
        return ResponseEntity.ok(service.approve(id, approverUserId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ChangeRequestDTO> reject(@PathVariable Long id, @RequestParam Long approverUserId) {
        return ResponseEntity.ok(service.reject(id, approverUserId));
    }


}
