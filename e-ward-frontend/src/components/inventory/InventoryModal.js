import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import medicineService from "../../services/medicineService";
import equipmentService from "../../services/equipmentService";
import { toast } from "react-toastify";
import { FaPlusCircle, FaBoxOpen, FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa";

export default function InventoryModal({ isOpen, type, onClose, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset form whenever the modal opens or the type changes
  useEffect(() => {
    reset({
      name: "",
      batchNumber: "",
      serialNumber: "",
      quantity: 0,
      threshold: type === "medicines" ? 5 : 1,
      location: "",
    });
  }, [isOpen, type, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
        threshold: Number(data.threshold),
      };

      if (type === "medicines") {
        await medicineService.create(payload);
        toast.success(`${data.name} added to Pharmacy stock`);
      } else {
        await equipmentService.create(payload);
        toast.success(`${data.name} registered to Assets`);
      }
      
      onSuccess(); // Refresh the list
      onClose();   // Close modal
    } catch (err) {
      toast.error("Failed to save inventory item");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          
          {/* Header */}
          <div className="modal-header border-0 p-4 pb-0">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-3 rounded-circle ${type === 'medicines' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                {type === 'medicines' ? <FaPlusCircle size={24} /> : <FaBoxOpen size={24} />}
              </div>
              <div>
                <h5 className="modal-title fw-bold">Add New {type === "medicines" ? "Medicine" : "Equipment"}</h5>
                <p className="text-muted small mb-0">Fill in the details to update the central registry</p>
              </div>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body p-4">
              <div className="row g-3">
                
                {/* Item Name */}
                <div className="col-12">
                  <label className="form-label fw-semibold small">Item Name</label>
                  <input 
                    className={`form-control rounded-3 ${errors.name ? 'is-invalid' : ''}`}
                    {...register("name", { required: "Name is required" })} 
                    placeholder={type === 'medicines' ? "e.g. Paracetamol 500mg" : "e.g. Ventilator X200"}
                  />
                </div>

                {/* Conditional Field: Batch vs Serial */}
                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    {type === "medicines" ? "Batch Number" : "Serial Number"}
                  </label>
                  <input 
                    className="form-control rounded-3"
                    {...register(type === "medicines" ? "batchNumber" : "serialNumber")} 
                    placeholder={type === 'medicines' ? "BN-99281" : "SN-XJ-00192"}
                  />
                </div>

                {/* Quantity */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Initial Quantity</label>
                  <input 
                    type="number" 
                    className="form-control rounded-3"
                    {...register("quantity", { required: true, min: 0 })} 
                  />
                </div>

                {/* Alert Threshold */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    <FaExclamationTriangle className="text-warning me-1" /> Alert Threshold
                  </label>
                  <input 
                    type="number" 
                    className="form-control rounded-3"
                    {...register("threshold", { required: true, min: 1 })} 
                  />
                </div>

                {/* Location */}
                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    <FaMapMarkerAlt className="me-1 opacity-50" /> Storage Location
                  </label>
                  <input 
                    className="form-control rounded-3"
                    {...register("location")} 
                    placeholder="e.g. Ward A - Cabinet 4"
                  />
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer border-0 p-4 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Discard
              </button>
              <button type="submit" className={`btn rounded-pill px-4 shadow-sm ${type === 'medicines' ? 'btn-primary' : 'btn-info text-white'}`}>
                Add to Inventory
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}