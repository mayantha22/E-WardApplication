package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.DutyRosterDTO;
import com.example.E_WardApplication.entity.DutyRoster;
import com.example.E_WardApplication.repository.DutyRosterRepository;
import com.example.E_WardApplication.service.DutyRosterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DutyRosterServiceImpl implements DutyRosterService {

    private final DutyRosterRepository repository;

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
