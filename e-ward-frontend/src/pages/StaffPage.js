import React, { useEffect, useState, useCallback } from "react";
import staffService from "../services/staffService";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import StaffTable from "../components/staff/StaffTable";
import StaffModal from "../components/staff/StaffModal";

export default function StaffPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, staffId: null, staffName: "" });
  const isAdmin = user?.role === "ADMIN";

  const loadStaff = useCallback(async () => {
    try {
      const data = await staffService.getAll();
      setStaffList(data);
    } catch (err) {
      toast.error("Failed to load staff directory");
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingStaff(null);
    setIsModalOpen(false);
  };

 /* const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await staffService.deleteStaff(id);
      toast.success("Staff member removed");
      loadStaff();
    } catch (err) {
      toast.error("Delete failed");
    }
  }; */
  const handleDelete = (id) => {
  const staff = staffList.find((s) => s.id === id);
  setDeleteModal({ show: true, staffId: id, staffName: staff?.name || "this staff member" });
  };

  const confirmDelete = async () => {
    try {
      await staffService.deleteStaff(deleteModal.staffId);
      toast.success("Staff member removed");
      setDeleteModal({ show: false, staffId: null, staffName: "" });
      loadStaff();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-5 bg-light min-vh-100">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Staff Directory</h3>
          <p className="text-muted small">Manage hospital personnel and ward assignments</p>
        </div>
        {isAdmin && (
          <button 
            className="btn btn-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-lg"></i> Add Staff Member
          </button>
        )}
      </div>

      {/* Full Width Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <StaffTable 
            staffList={staffList} 
            isAdmin={isAdmin} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <StaffModal 
          isOpen={isModalOpen}
          editingStaff={editingStaff}
          onClose={handleCloseModal}
          onRefresh={loadStaff}
        />
      )}
      {/* DELETE CONFIRM MODAL */}
      {deleteModal.show && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "380px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 px-4 pt-4 pb-0">
                <h5 className="fw-bold">🗑 Remove Staff Member</h5>
                <button className="btn-close" onClick={() => setDeleteModal({ show: false })} />
              </div>
              <div className="modal-body px-4 py-3">
                <p className="text-muted mb-0">
                  Are you sure you want to remove{" "}
                  <strong className="text-dark">{deleteModal.staffName}</strong>{" "}
                  from the staff directory? This action cannot be undone.
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
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  