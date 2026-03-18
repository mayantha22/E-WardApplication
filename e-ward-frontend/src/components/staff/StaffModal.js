import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import staffService from "../../services/staffService";
import { toast } from "react-toastify";

export default function StaffModal({ isOpen, editingStaff, onClose, onRefresh }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (editingStaff) {
      reset(editingStaff);
    } else {
      reset({ fullName: "", employeeNumber: "", phone: "", designation: "", ward: "", email: "", address: ""});
    }
  }, [editingStaff, reset]);

  const onSubmit = async (data) => {
    try {
      if (editingStaff) {
        await staffService.update(editingStaff.id, data);
        toast.success("Staff details updated");
      } else {
        await staffService.create(data);
        toast.success("New staff member registered");
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error("Save failed. Please try again.");
    }
  };

  return (
    <>
      <div className={`modal fade show d-block`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold ms-2">{editingStaff ? "Edit Staff Member" : "Add New Staff"}</h5>
              <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input className="form-control rounded-3" {...register("fullName", { required: true })} placeholder="Dr. John Doe" />
                  </div>

                {/*ADDDRESS */}
                  <div className="col-12">
                    <label className="form-label small fw-bold">Residential Address</label>
                    <textarea 
                      className="form-control rounded-3" 
                      {...register("address")} 
                      placeholder="Enter address"
                      rows="2"
                    ></textarea>
                  </div>


                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Employee Number</label>
                    <input className="form-control rounded-3" {...register("employeeNumber")} placeholder="EMP-1234" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Designation</label>
                    <input className="form-control rounded-3" {...register("designation")} placeholder="Senior Surgeon" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Ward</label>
                    <input className="form-control rounded-3" {...register("ward")} placeholder="Cardiology" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Phone</label>
                    <input className="form-control rounded-3" {...register("phone")} placeholder="+1 234 567 890" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input type="email" className="form-control rounded-3" {...register("email", { required: true })} placeholder="john.doe@medicore.com" />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 px-4 pb-4">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                  {editingStaff ? "Save Changes" : "Register Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}