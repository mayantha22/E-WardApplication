package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.MedicineInventoryDTO;
import com.example.E_WardApplication.service.MedicineInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineInventoryService service;

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping
    public ResponseEntity<MedicineInventoryDTO> create(@RequestBody MedicineInventoryDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<MedicineInventoryDTO> update(@PathVariable Long id, @RequestBody MedicineInventoryDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<MedicineInventoryDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<MedicineInventoryDTO>> list() {
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
    public ResponseEntity<MedicineInventoryDTO> adjust(@PathVariable Long id, @RequestParam int delta) {
        return ResponseEntity.ok(service.adjustStock(id, delta));
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @GetMapping("/report/low-stock")
    public ResponseEntity<List<MedicineInventoryDTO>> getLowStock() {
        return ResponseEntity.ok(service.getLowStockMedicines());
    }


}
