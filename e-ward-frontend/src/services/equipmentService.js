import api from "./api";

function getAll() {
  return api.get("/equipment");
}

function getById(id) {
  return api.get(`/equipment/${id}`);
}

function create(dto) {
  return api.post("/equipment", dto);
}

function update(id, dto) {
  return api.put(`/equipment/${id}`, dto);
}

function deleteEquipment(id) {
  return api.delete(`/equipment/${id}`);
}

function adjust(id, delta) {
  return api.post(`/equipment/${id}/adjust?delta=${delta}`);
}

export default {
  getAll,
  getById,
  create,
  update,
  deleteEquipment,
  adjust
};
