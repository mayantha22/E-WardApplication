package com.example.E_WardApplication.service;

import com.example.E_WardApplication.dto.EquipmentInventoryDTO;

import java.util.List;

public interface EquipmentInventoryService {

    EquipmentInventoryDTO create(EquipmentInventoryDTO dto);
    EquipmentInventoryDTO update(Long id, EquipmentInventoryDTO dto);
    EquipmentInventoryDTO getById(Long id);
    List<EquipmentInventoryDTO> getAll();
    void delete(Long id);
    EquipmentInventoryDTO adjustStock(Long id, int delta);
    List<EquipmentInventoryDTO> getLowStockEquipment();


}
