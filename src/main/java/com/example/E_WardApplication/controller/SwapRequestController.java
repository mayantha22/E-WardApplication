package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.DirectSwapCreateDTO;
import com.example.E_WardApplication.dto.SwapRequestDTO;
import com.example.E_WardApplication.service.SwapRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SwapRequestController {

    private final SwapRequestService service;

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/direct")
    public ResponseEntity<SwapRequestDTO> createDirect(@RequestBody DirectSwapCreateDTO dto) {
        return ResponseEntity.ok(service.createDirectSwap(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/admin-direct")
    public ResponseEntity<SwapRequestDTO> createAdminDirect(@RequestBody DirectSwapCreateDTO dto) {
        return ResponseEntity.ok(service.createAdminDirectSwap(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/indirect")
    public ResponseEntity<SwapRequestDTO> createIndirect(@RequestBody DirectSwapCreateDTO dto) {
        return ResponseEntity.ok(service.createIndirectSwap(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/{id}/peer-approve")
    public ResponseEntity<SwapRequestDTO> peerApprove(@PathVariable Long id, @RequestParam Long approverUserId) {
        return ResponseEntity.ok(service.approvePeer(id, approverUserId));
    }

    //peer-reject
    @PostMapping("/{id}/peer-reject")
    @PreAuthorize("hasAnyRole('STAFF')")
    public ResponseEntity<SwapRequestDTO> peerReject(
            @PathVariable Long id,
            @RequestParam Long approverUserId
    ) {
        return ResponseEntity.ok(service.rejectByPeer(id, approverUserId));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/admin-approve")
    public ResponseEntity<SwapRequestDTO> adminApprove(@PathVariable Long id, @RequestParam Long approverUserId) {
        return ResponseEntity.ok(service.approveByAdmin(id, approverUserId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/admin-reject")
    public ResponseEntity<SwapRequestDTO> adminReject(@PathVariable Long id, @RequestParam Long approverUserId) {
        return ResponseEntity.ok(service.rejectByAdmin(id, approverUserId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<SwapRequestDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<SwapRequestDTO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {

        // If parameters are present, use the filter logic
        if (userId != null || role != null) {
            return ResponseEntity.ok(service.getAllFiltered(userId, role));
        }

        // Fallback to returning everything (or you can return empty list for security)
        return ResponseEntity.ok(service.getAll());
    }


}
