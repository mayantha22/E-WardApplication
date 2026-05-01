import api from "./api";


// CREATE SWAPS


// Direct peer-to-peer swap (requires targetStaffId)
function directSwap(dto) {
  return api.post("/swaps/direct", dto);
}

// Admin-requested direct swap (user selects target, admin must approve)
function adminRequest(dto) {
  return api.post("/swaps/admin-direct", dto);
}

// Indirect request (admin assigns later)
function indirectRequest(dto) {
  return api.post("/swaps/indirect", dto);
}

// ──────────────────────────────────────────────
// READ OPERATIONS
// ──────────────────────────────────────────────

function getAll(userId, role) {
  return api.get(`/swaps?userId=${userId}&role=${role}`);
}

function get(id) {
  return api.get(`/swaps/${id}`);
}

// ──────────────────────────────────────────────
// APPROVAL WORKFLOW
// ──────────────────────────────────────────────

// Peer approval
function peerApprove(id, approverUserId) {
  return api.post(`/swaps/${id}/peer-approve?approverUserId=${approverUserId}`);
}

// Peer rejection
function peerReject(id, approverUserId) {
  return api.post(`/swaps/${id}/peer-reject?approverUserId=${approverUserId}`);
}

// Admin approval
function adminApprove(id, approverUserId) {
  return api.post(`/swaps/${id}/admin-approve?approverUserId=${approverUserId}`);
}

// Admin rejection
function adminReject(id, approverUserId) {
  return api.post(`/swaps/${id}/admin-reject?approverUserId=${approverUserId}`);
}

// FETCH TARGET STAFF DUTIES
/*function getStaffSlots(month, year, staffId) {
  return api.get(`/rosters/${month}/${year}/staff/${staffId}/slots`);
}*/

function getStaffSlots(rosterId, year, staffId) {
  return api.get(`/rosters/${rosterId}/${year}/staff/${staffId}/slots`);
}

function assignIndirectSlot(id, dto) {
  return api.patch(`/swaps/${id}/assign-indirect`, dto);
}

// ──────────────────────────────────────────────
// EXPORT
// ──────────────────────────────────────────────

export default {
  directSwap,
  adminRequest, 
  indirectRequest,
  getAll,
  get,
  peerApprove,
  peerReject,
  adminApprove,
  adminReject,
  getStaffSlots,
  assignIndirectSlot
};
