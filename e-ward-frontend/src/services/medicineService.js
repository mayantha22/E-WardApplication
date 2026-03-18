import api from "./api";

function getAll() {
  return api.get("/medicines");
}

function getById(id) {
  return api.get(`/medicines/${id}`);
}

function create(dto) {
  return api.post("/medicines", dto);
}

function update(id, dto) {
  return api.put(`/medicines/${id}`, dto);
}

function deleteMedicine(id) {
  return api.delete(`/medicines/${id}`);
}

function adjust(id, delta) {
  return api.post(`/medicines/${id}/adjust?delta=${delta}`);
}

export default {
  getAll,
  getById,
  create,
  update,
  deleteMedicine,
  adjust
};
