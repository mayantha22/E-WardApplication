import axios from "axios";
import api from "./api";

function getAll() {
  return api.get("/patients");
}

function getById(id) {
  return api.get(`/patients/${id}`);
}

function create(dto) {
  return api.post("/patients", dto);
}

function update(id, dto) {
  return api.put(`/patients/${id}`, dto);
}

function deletePatient(id) {
  return api.delete(`/patients/${id}`);
}

function transfer(id, targetWard) {
  // request param 'targetWard'
  return api.post(`/patients/${id}/transfer?targetWard=${encodeURIComponent(targetWard)}`);
}


async function downloadReport(id) {
  const token = localStorage.getItem("eward_token");

  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE || "http://localhost:8080/api"}/patients/${id}/report`,
    {
      responseType: "arraybuffer",
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );

  const file = new Blob([response.data], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);

  const link = document.createElement("a");
  link.href = fileURL;
  link.download = `patient_report_${id}.pdf`;
  link.click();

  URL.revokeObjectURL(fileURL);
}






export default {
  getAll,
  getById,
  create,
  update,
  deletePatient,
  transfer,
  downloadReport
};
