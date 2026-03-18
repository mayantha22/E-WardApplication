import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import patientService from "../../services/patientService";
import { toast } from "react-toastify";

export default function AddPatientModal({
  show,
  onClose,
  onSuccess,
  editingPatient,
}) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (editingPatient) {
      reset(editingPatient);
    } else {
      reset({
        fullName: "",
        medicalRecordNumber: "",
        contact: "",
        assignedWard: "",
        notes: "",
        address: "",
      });
    }
  }, [editingPatient, reset]);

  const onSubmit = async (data) => {
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, data);
        toast.success("Patient updated");
      } else {
        await patientService.create(data);
        toast.success("Patient created");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingPatient ? "Edit Patient" : "Add Patient"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input className="form-control" {...register("fullName", { required: true })} />
          </div>

          <div className="mb-3">
            <label className="form-label">Medical Record #</label>
            <input className="form-control" {...register("medicalRecordNumber")} />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact</label>
            <input className="form-control" {...register("contact")} />
          </div>

          <div className="mb-3">
            <label className="form-label">Assigned Ward</label>
            <input className="form-control" {...register("assignedWard")} />
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea 
              className="form-control" 
              rows="2" 
              {...register("address")} 
              placeholder="Enter patient's home address"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea className="form-control" {...register("notes")} />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPatient ? "Save Changes" : "Add Patient"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
