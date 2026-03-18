import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import updateService from "../../services/updateService";
import { formatDateTime } from "../../utils/helpers";
import { toast } from "react-toastify";

export default function DailyUpdatesModal({ show, onClose, patient }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // Function to load updates for the specific patient
  const loadUpdates = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await updateService.getByPatient(patient.id);
      setUpdates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  }, [patient]);

  // Load updates whenever the modal opens for a new patient
  useEffect(() => {
    if (show && patient) {
      loadUpdates();
    }
  }, [show, patient, loadUpdates]);

  const onSubmit = async (data) => {
    try {
      // Assuming '1' is the recorder ID for now, adjust as per your auth logic
      await updateService.addUpdate(patient.id, data.summary, 1); 
      toast.success("Update added");
      reset();
      loadUpdates(); // Refresh the list
    } catch (err) {
      toast.error("Failed to save update");
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered className="border-0">
      <Modal.Header closeButton className="border-0 bg-light">
        <Modal.Title className="fw-bold">
          📝 Daily Updates: {patient?.fullName}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* Add New Update Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
          <label className="form-label small fw-bold">New Clinical Observation</label>
          <div className="input-group shadow-sm">
            <input
              className="form-control border-end-0"
              placeholder="e.g., Stable condition, vitals normal..."
              {...register("summary", { required: true })}
            />
            <button className="btn btn-primary px-4" type="submit">
              Add
            </button>
          </div>
        </form>

        <hr />

        {/* History List */}
        <h6 className="fw-bold mb-3">Update History</h6>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-3">Loading...</div>
          ) : updates.length > 0 ? (
            <ul className="list-group list-group-flush">
              {updates.map((u) => (
                <li key={u.id} className="list-group-item px-0 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="text-muted small">
                        {formatDateTime(u.updateDate)}
                      </div>
                      <div className="mt-1">{u.summary}</div>
                    </div>
                    {u.recordedByName && (
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                        By: {u.recordedByName}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted py-4">
              No updates recorded for this patient.
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <Button variant="light" onClick={onClose} className="rounded-pill px-4">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}