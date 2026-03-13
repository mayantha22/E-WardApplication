package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.DutyRosterDTO;
import com.example.E_WardApplication.service.DutyRosterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rosters")
public class DutyRosterController {

    private final DutyRosterService service;

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DutyRosterDTO> create(@RequestBody DutyRosterDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<DutyRosterDTO> update(@PathVariable Long id, @RequestBody DutyRosterDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<DutyRosterDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<DutyRosterDTO>> list() {
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
