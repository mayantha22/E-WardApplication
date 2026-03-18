import api from "./api";

function getAll() {
  return api.get("/rosters");
}

function getById(id) {
  return api.get(`/rosters/${id}`);
}

function create(dto) {
  return api.post("/rosters", dto);
}

function update(id, dto) {
  return api.put(`/rosters/${id}`, dto);
}

function deleteRoster(id) {
  return api.delete(`/rosters/${id}`);
}

export default {
  getAll,
  getById,
 create,
 update,
 deleteRoster
};
