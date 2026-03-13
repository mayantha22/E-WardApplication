package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.EquipmentInventoryDTO;
import com.example.E_WardApplication.service.EquipmentInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentInventoryService service;

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping
    public ResponseEntity<EquipmentInventoryDTO> create(@RequestBody EquipmentInventoryDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentInventoryDTO> update(@PathVariable Long id, @RequestBody EquipmentInventoryDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentInventoryDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<EquipmentInventoryDTO>> list() {
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping("/{id}/adjust")
    public ResponseEntity<EquipmentInventoryDTO> adjust(@PathVariable Long id, @RequestParam int delta) {
        return ResponseEntity.ok(service.adjustStock(id, delta));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/report/low-stock")
    public ResponseEntity<List<EquipmentInventoryDTO>> getLowStockEquipment() {
        return ResponseEntity.ok(service.getLowStockEquipment());
    }




}
