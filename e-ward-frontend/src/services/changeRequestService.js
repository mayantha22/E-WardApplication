import api from "./api";

function create(dto) {
  return api.post("/change-requests", dto);
}

function getAll() {
  return api.get("/change-requests");
}

function approve(id, approverUserId) {
  return api.post(`/change-requests/${id}/approve?approverUserId=${approverUserId}`);
}

function reject(id, approverUserId) {
  return api.post(`/change-requests/${id}/reject?approverUserId=${approverUserId}`);
}

export default { create, getAll, approve, reject };

