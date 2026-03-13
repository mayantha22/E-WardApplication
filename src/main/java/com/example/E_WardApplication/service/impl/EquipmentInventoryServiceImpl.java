package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.EquipmentInventoryDTO;
import com.example.E_WardApplication.entity.EquipmentInventory;
import com.example.E_WardApplication.repository.EquipmentInventoryRepository;
import com.example.E_WardApplication.service.EquipmentInventoryService;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentInventoryServiceImpl implements EquipmentInventoryService {

    private final EquipmentInventoryRepository repository;
    private final NotificationService notificationService;

    @Override
    public EquipmentInventoryDTO create(EquipmentInventoryDTO dto) {
        EquipmentInventory e = EquipmentInventory.builder()
                .name(dto.getName())
                .serialNumber(dto.getSerialNumber())
                .quantity(dto.getQuantity())
                .threshold(dto.getThreshold() <= 0 ? 1 : dto.getThreshold())
                .location(dto.getLocation())
                .lastUpdated(Instant.now())
                .build();
        EquipmentInventory saved = repository.save(e);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }

    @Override
    public EquipmentInventoryDTO update(Long id, EquipmentInventoryDTO dto) {
        EquipmentInventory e = repository.findById(id).orElseThrow(() -> new RuntimeException("Equipment not found"));
        e.setName(dto.getName());
        e.setSerialNumber(dto.getSerialNumber());
        e.setQuantity(dto.getQuantity());
        e.setThreshold(dto.getThreshold());
        e.setLocation(dto.getLocation());
        e.setLastUpdated(Instant.now());
        EquipmentInventory saved = repository.save(e);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }

    @Override
    public EquipmentInventoryDTO getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    @Override
    public List<EquipmentInventoryDTO> getAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public EquipmentInventoryDTO adjustStock(Long id, int delta) {
        EquipmentInventory e = repository.findById(id).orElseThrow(() -> new RuntimeException("Equipment not found"));
        e.setQuantity(e.getQuantity() + delta);
        e.setLastUpdated(Instant.now());
        EquipmentInventory saved = repository.save(e);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }

    private void checkLowStockAndNotify(EquipmentInventory e) {
        if (e.getQuantity() <= e.getThreshold()) {
            String msg = "Low equipment stock: " + e.getName() + " (qty: " + e.getQuantity() + ")";
            notificationService.createNotificationForRole("ADMIN", msg, "LOW_STOCK");
        }
    }

    @Override
    public List<EquipmentInventoryDTO> getLowStockEquipment() {
        return repository.findAll().stream()
                .filter(e -> e.getQuantity() <= e.getThreshold())
                .map(this::toDto) // assuming you also have a toDto() method for equipment
                .collect(Collectors.toList());
    }


    private EquipmentInventoryDTO toDto(EquipmentInventory e) {
        EquipmentInventoryDTO dto = new EquipmentInventoryDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setSerialNumber(e.getSerialNumber());
        dto.setQuantity(e.getQuantity());
        dto.setThreshold(e.getThreshold());
        dto.setLocation(e.getLocation());
        dto.setLastUpdated(e.getLastUpdated());
        return dto;
    }


}
