package com.example.E_WardApplication.controller;

import com.example.E_WardApplication.dto.DutyRosterDTO;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.DutyRosterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rosters")
public class DutyRosterController {

    private final DutyRosterService service;
    private final StaffRepository staffRepository;


    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DutyRosterDTO> create(@RequestBody DutyRosterDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
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

//    @GetMapping("/staff/search")
//    @PreAuthorize("hasAnyRole('ADMIN')")
//    public ResponseEntity<List<Map<String, Object>>> searchStaff(@RequestParam String keyword) {
//        List<Map<String, Object>> result = StaffRepository.findByNameContainingIgnoreCase(keyword)
//                .stream()
//                .map(s -> Map.of(
//                        "id", s.getId(),
//                        "name", s.getUser().getFullName(),
//                        "role", s.getDesignation(),
//                        "email", s.getEmail()
//                ))
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(result);
//    }

//    @GetMapping("/staff/search")
//    @PreAuthorize("hasAnyRole('ADMIN')")
//    public ResponseEntity<List<Map<String, Object>>> searchStaff(@RequestParam String keyword) {
//        List<Map<String, Object>> result = StaffRepository.findByUser_FullNameContainingIgnoreCase(keyword)
//                .stream()
//                .map(s -> {
//                    Map<String, Object> map = new HashMap<>();
//                    map.put("id", s.getId());
//                    map.put("name", s.getUser().getFullName());
//                    map.put("role", s.getDesignation());
//                    map.put("email", s.getEmail());
//                    return map;
//                })
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(result);
//    }

    @GetMapping("/staff/search")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<Map<String, Object>>> searchStaff(@RequestParam String keyword) {
        List<Map<String, Object>> result = staffRepository
                .findByUser_FullNameContainingIgnoreCase(keyword) // ✅ uses nested property
                .stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("name", s.getUser().getFullName());
                    map.put("role", s.getDesignation());
                    map.put("email", s.getEmail());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // NEW - GRAB THE STAFFSHIFT
//    @GetMapping("/{month}/{year}/staff/{staffId}/slots")
//    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
//    public ResponseEntity<List<Map<String,String>>> getStaffSlotsForMonth(
//            @PathVariable int month,
//            @PathVariable int year,
//            @PathVariable Long staffId) {
//
//        // iterate rosters and build a list of { date, shift } where staffId is assigned
//        List<Map<String, String>> slots = service.findSlotsForStaffInMonth(staffId, month, year);
//        return ResponseEntity.ok(slots);
//    }

    // ✅ Change {month} to {rosterId}
    @GetMapping("/{rosterId}/{year}/staff/{staffId}/slots")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<Map<String,String>>> getStaffSlotsForMonth(
            @PathVariable Long rosterId,
            @PathVariable int year,
            @PathVariable Long staffId) {

        List<Map<String, String>> slots = service.findSlotsForStaffInRoster(staffId, rosterId);
        return ResponseEntity.ok(slots);
    }




}
