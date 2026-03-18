import React, { useEffect, useState, useCallback } from "react";
import patientService from "../services/patientService";
import { toast } from "react-toastify";
import PatientTable from "../components/patients/PatientTable";
import AddPatientModal from "../components/patients/AddPatientModal";
import DailyUpdatesModal from "../components/patients/DailyUpdatesModal";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // DELETE modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, patientId: null, patientName: "" });

  // TRANSFER modal state
  const [transferModal, setTransferModal] = useState({ show: false, patient: null, ward: "" });

  const loadPatients = useCallback(async () => {
    try {
      const data = await patientService.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load patients");
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Open delete modal
  const handleDelete = (id) => {
    const patient = patients.find((p) => p.id === id);
    setDeleteModal({ show: true, patientId: id, patientName: patient?.name || "this patient" });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await patientService.deletePatient(deleteModal.patientId);
      toast.success("Patient deleted");
      setDeleteModal({ show: false, patientId: null, patientName: "" });
      loadPatients();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Open transfer modal
  const handleTransfer = (patient) => {
    setTransferModal({ show: true, patient, ward: patient.assignedWard || "" });
  };

  // Confirm transfer
  const confirmTransfer = async () => {
    if (!transferModal.ward.trim()) {
      toast.error("Please enter a target ward");
      return;
    }
    try {
      await patientService.transfer(transferModal.patient.id, transferModal.ward);
      toast.success("Patient transferred");
      setTransferModal({ show: false, patient: null, ward: "" });
      loadPatients();
    } catch {
      toast.error("Transfer failed");
    }
  };

  const handleOpenUpdates = (patient) => {
    setSelectedPatient(patient);
    setShowUpdates(true);
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-semibold">Patient Management</h4>
          <button
            className="btn btn-primary px-4"
            onClick={() => {
              setEditingPatient(null);
              setShowModal(true);
            }}
          >
            + Add Patient
          </button>
        </div>

        <div className="card shadow-sm border-0 rounded-4 p-4">
          <PatientTable
            patients={patients}
            onEdit={(p) => {
              setEditingPatient(p);
              setShowModal(true);
            }}
            onDelete={handleDelete}
            onTransfer={handleTransfer}
            onOpenUpdates={handleOpenUpdates}
            onReport={(id) => patientService.downloadReport(id)}
          />
        </div>

        <AddPatientModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadPatients}
          editingPatient={editingPatient}
        />

        <DailyUpdatesModal
          show={showUpdates}
          onClose={() => setShowUpdates(false)}
          patient={selectedPatient}
        />

        {/* DELETE CONFIRM MODAL */}
        {deleteModal.show && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "380px" }}>
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 px-4 pt-4 pb-0">
                  <h5 className="fw-bold">🗑 Delete Patient</h5>
                  <button className="btn-close" onClick={() => setDeleteModal({ show: false })} />
                </div>
                <div className="modal-body px-4 py-3">
                  <p className="text-muted mb-0">
                    Are you sure you want to delete{" "}
                    <strong className="text-dark">{deleteModal.patientName}</strong>?
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-0">
                  <button
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setDeleteModal({ show: false })}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger rounded-pill px-4" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSFER MODAL */}
        {transferModal.show && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 px-4 pt-4 pb-0">
                  <div>
                    <h5 className="fw-bold mb-0">🏥 Transfer Patient</h5>
                    <p className="text-muted small mb-0">{transferModal.patient?.name}</p>
                  </div>
                  <button className="btn-close" onClick={() => setTransferModal({ show: false })} />
                </div>
                <div className="modal-body px-4 py-3">

                  {/* Current ward info */}
                  <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center gap-2">
                    <span className="text-muted small">Current Ward:</span>
                    <span className="fw-semibold text-primary">
                      {transferModal.patient?.assignedWard || "N/A"}
                    </span>
                  </div>

                  {/* Target ward input */}
                  <label className="form-label small fw-semibold text-muted">
                    Transfer to Ward
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g. Ward B, ICU, Cardiology"
                    value={transferModal.ward}
                    onChange={(e) =>
                      setTransferModal((prev) => ({ ...prev, ward: e.target.value }))
                    }
                  />
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-0">
                  <button
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setTransferModal({ show: false })}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={confirmTransfer}
                    disabled={!transferModal.ward.trim()}
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}