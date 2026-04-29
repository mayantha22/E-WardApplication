package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.DutyRosterDTO;
import com.example.E_WardApplication.entity.DutyRoster;
import com.example.E_WardApplication.entity.staff;
import com.example.E_WardApplication.repository.DutyRosterRepository;
import com.example.E_WardApplication.repository.StaffRepository;
import com.example.E_WardApplication.service.DutyRosterService;
import com.example.E_WardApplication.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DutyRosterServiceImpl implements DutyRosterService {

    private final DutyRosterRepository repository;
    private final EmailService emailService;
    private final StaffRepository staffRepository;

    @Override
    public DutyRosterDTO create(DutyRosterDTO dto) {
        DutyRoster d = DutyRoster.builder()
                .month(dto.getMonth())
                .year(dto.getYear())
                .ward(dto.getWard())
                .data(dto.getData())
                .createdAt(Instant.now())
                .build();
        DutyRoster saved = repository.save(d);

        //notifyAssignedStaff(dto);

        return toDto(saved);
    }

    @Override
    public DutyRosterDTO update(Long id, DutyRosterDTO dto) {
        DutyRoster d = repository.findById(id).orElseThrow(() -> new RuntimeException("Duty roster not found"));
        d.setMonth(dto.getMonth());
        d.setYear(dto.getYear());
        d.setWard(dto.getWard());
        d.setData(dto.getData());
        DutyRoster saved = repository.save(d);

        //notifyAssignedStaff(dto);

        return toDto(saved);
    }

    @Override
    public DutyRosterDTO getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Duty roster not found"));
    }

    @Override
    public List<DutyRosterDTO> getAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

//    private void notifyAssignedStaff(DutyRosterDTO dto) {
//        dto.getData().forEach((date, shifts) -> {
//            sendNotification(shifts.get("morning"), "Morning", date, dto.getWard());
//            sendNotification(shifts.get("evening"), "Evening", date, dto.getWard());
//            sendNotification(shifts.get("night"), "Night", date, dto.getWard());
//        });
//    }

//    private void sendNotification(Long staffId, String shift, String date, String ward) {
//        if (staffId == null) return;
//        staff s = staffRepository.findById(staffId)
//                .orElseThrow(() -> new RuntimeException("Staff not found: " + staffId));
//        String email = s.getUser().getEmail();
//        String msg = "You are assigned to " + shift + " shift on " + date + " in ward " + ward;
//        emailService.sendEmail(email, "Duty Roster Assignment", msg);
//    }

    @Override
    public boolean staffHasSlot(Long staffId, LocalDate date, String shift) {
        int month = date.getMonthValue();
        int year = date.getYear();
        List<DutyRoster> rosters = repository.findAll().stream()
                .filter(r -> r.getMonth() == month && r.getYear() == year)
                .collect(Collectors.toList());

        String key = date.toString();
        for (DutyRoster roster : rosters) {
            Map<String, Object> data = roster.getData();
            if (data == null) continue;
            if (!data.containsKey(key)) continue;
            Map<String, Object> shifts = (Map<String, Object>) data.get(key);
            if (shifts == null) continue;
            List<Map<String, Object>> list = (List<Map<String, Object>>) shifts.getOrDefault(shift.toLowerCase(), new ArrayList<>());
            for (Map<String, Object> m : list) {
                Object idObj = m.get("id");
                long idVal = idObj instanceof Integer ? ((Integer) idObj).longValue() : (Long) idObj;
                if (Objects.equals(idVal, staffId)) return true;
            }
        }
        return false;
    }

    @Override
    public List<Map<String, String>> findSlotsForStaffInMonth(Long staffId, int month, int year) {
        List<Map<String, String>> result = new ArrayList<>();
        List<DutyRoster> rosters = repository.findAll().stream()
                .filter(r -> r.getMonth() == month && r.getYear() == year)
                .collect(Collectors.toList());

        for (DutyRoster roster : rosters) {
            Map<String, Object> data = roster.getData();
            if (data == null) continue;
            for (String dateKey : data.keySet()) {
                Map<String, Object> shifts = (Map<String, Object>) data.get(dateKey);
                if (shifts == null) continue;
                for (String shiftName : Arrays.asList("morning", "evening", "night")) {
                    List<Map<String, Object>> list = (List<Map<String, Object>>) shifts.getOrDefault(shiftName, new ArrayList<>());
                    for (Map<String, Object> entry : list) {
                        Object idObj = entry.get("id");
                        long idVal = idObj instanceof Integer ? ((Integer) idObj).longValue() : (Long) idObj;
                        if (Objects.equals(idVal, staffId)) {
                            Map<String, String> m = new HashMap<>();
                            m.put("date", dateKey);
                            m.put("shift", shiftName);
                            result.add(m);
                        }
                    }
                }
            }
        }
        return result;
    }

    //FILTER SLOTS BY ROSTER ID
    @Override
    public List<Map<String, String>> findSlotsForStaffInRoster(Long staffId, Long rosterId) {
        List<Map<String, String>> result = new ArrayList<>();

        DutyRoster roster = repository.findById(rosterId)
                .orElseThrow(() -> new RuntimeException("Roster not found"));

        Map<String, Object> data = roster.getData();
        if (data == null) return result;

        for (String dateKey : data.keySet()) {
            Map<String, Object> shifts = (Map<String, Object>) data.get(dateKey);
            if (shifts == null) continue;
            for (String shiftName : Arrays.asList("morning", "evening", "night")) {
                List<Map<String, Object>> list = (List<Map<String, Object>>) shifts.getOrDefault(shiftName, new ArrayList<>());
                for (Map<String, Object> entry : list) {
                    Object idObj = entry.get("id");
                    long idVal = idObj instanceof Integer ? ((Integer) idObj).longValue() : (Long) idObj;
                    if (Objects.equals(idVal, staffId)) {
                        Map<String, String> m = new HashMap<>();
                        m.put("date", dateKey);
                        m.put("shift", shiftName);
                        result.add(m);
                    }
                }
            }
        }
        return result;
    }


    private DutyRosterDTO toDto(DutyRoster d) {
        DutyRosterDTO dto = new DutyRosterDTO();
        dto.setId(d.getId());
        dto.setMonth(d.getMonth());
        dto.setYear(d.getYear());
        dto.setWard(d.getWard());
        dto.setData(d.getData());
        dto.setCreatedAt(d.getCreatedAt());
        return dto;
    }
}
