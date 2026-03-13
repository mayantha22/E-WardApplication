package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.MedicineInventoryDTO;

import java.util.List;

public interface MedicineInventoryService {

    MedicineInventoryDTO create(MedicineInventoryDTO dto);
    MedicineInventoryDTO update(Long id, MedicineInventoryDTO dto);
    MedicineInventoryDTO getById(Long id);
    List<MedicineInventoryDTO> getAll();
    void delete(Long id);
    List<MedicineInventoryDTO> getLowStockMedicines();

    // adjust stock (positive or negative delta)
    MedicineInventoryDTO adjustStock(Long id, int delta);

}
