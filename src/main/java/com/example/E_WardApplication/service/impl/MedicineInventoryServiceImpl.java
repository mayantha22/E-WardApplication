package com.example.E_WardApplication.service.impl;

import com.example.E_WardApplication.dto.MedicineInventoryDTO;
import com.example.E_WardApplication.entity.MedicineInventory;
import com.example.E_WardApplication.repository.MedicineInventoryRepository;
import com.example.E_WardApplication.service.MedicineInventoryService;
import com.example.E_WardApplication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class MedicineInventoryServiceImpl implements MedicineInventoryService {

    private final MedicineInventoryRepository medicineRepository;
    private final NotificationService notificationService;

    @Override
    public MedicineInventoryDTO create(MedicineInventoryDTO dto) {
        MedicineInventory m = MedicineInventory.builder()
                .name(dto.getName())
                .batchNumber(dto.getBatchNumber())
                .quantity(dto.getQuantity())
                .threshold(dto.getThreshold() <= 0 ? 5 : dto.getThreshold())
                .location(dto.getLocation())
                .lastUpdated(Instant.now())
                .build();
        MedicineInventory saved = medicineRepository.save(m);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }

    @Override
    public MedicineInventoryDTO update(Long id, MedicineInventoryDTO dto){
        MedicineInventory m = medicineRepository.findById(id).orElseThrow(() -> new RuntimeException("Medicine not found"));
        m.setName(dto.getName());
        m.setBatchNumber(dto.getBatchNumber());
        m.setQuantity(dto.getQuantity());
        m.setThreshold(dto.getThreshold());
        m.setLocation(dto.getLocation());
        m.setLastUpdated(Instant.now());
        MedicineInventory saved = medicineRepository.save(m);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }

    @Override
    public MedicineInventoryDTO getById(Long id){
        return medicineRepository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Medicine not found"));
    }

    @Override
    public List<MedicineInventoryDTO> getAll() {
        return medicineRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void delete(Long id){
         medicineRepository.deleteById(id);
    }

    @Override
    public MedicineInventoryDTO adjustStock(Long id, int delta) {
        MedicineInventory m = medicineRepository.findById(id).orElseThrow(() -> new RuntimeException("Medicine not found"));
        m.setQuantity(m.getQuantity() + delta);
        m.setLastUpdated(Instant.now());
        MedicineInventory saved = medicineRepository.save(m);
        checkLowStockAndNotify(saved);
        return toDto(saved);
    }


    private void checkLowStockAndNotify(MedicineInventory m) {
        if (m.getQuantity() <= m.getThreshold()) {
            String msg = "Low stock alert: " + m.getName() + " (qty: " + m.getQuantity() + ")";
            // For now send to system admin (user id 1 assumed) — better: query admin users
            notificationService.createNotificationForRole("ADMIN", msg, "LOW_STOCK");
        }
    }

    //for report generation
    @Override
    public List<MedicineInventoryDTO> getLowStockMedicines() {
        return medicineRepository.findAll().stream()
                .filter(m -> m.getQuantity() <= m.getThreshold())
                .map(this::toDto) // use your existing toDto() method
                .collect(Collectors.toList()); // safer for Java 8/11 compatibility
    }



    private MedicineInventoryDTO toDto(MedicineInventory m) {
        MedicineInventoryDTO dto = new MedicineInventoryDTO();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setBatchNumber(m.getBatchNumber());
        dto.setQuantity(m.getQuantity());
        dto.setThreshold(m.getThreshold());
        dto.setLocation(m.getLocation());
        dto.setLastUpdated(m.getLastUpdated());
        return dto;
    }

}
