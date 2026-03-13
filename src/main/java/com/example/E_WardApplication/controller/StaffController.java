package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.staffDTO;
import com.example.E_WardApplication.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public ResponseEntity<staffDTO> create(@RequestBody staffDTO dto) {
        staffDTO created = staffService.createStaff(dto);
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<staffDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<staffDTO> update(@PathVariable Long id, @RequestBody staffDTO dto) {
        return ResponseEntity.ok(staffService.updateStaff(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<staffDTO>> list() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    // ✅ NEW — fetch staff info by linked userId
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<staffDTO> getByUserId(@PathVariable Long userId) {
        staffDTO staff = staffService.getByUserId(userId);
        return ResponseEntity.ok(staff);
    }
}


