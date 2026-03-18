import api from "./api";

// Get all updates for a patient
function getByPatient(patientId) {
  return api.get(`/patients/${patientId}/updates`);
}

// Add a new update (backend now expects summary + appUserId)
function addUpdate(patientId, summary, appUserId) {
  return api.post(`/patients/${patientId}/updates`, {
    summary, 
    appUserId  // ✅ was staffId, now appUserId
  });
}

export default {
  getByPatient,
  addUpdate  
};
