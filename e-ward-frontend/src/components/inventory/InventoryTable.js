import React, { useState } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaMapMarkerAlt } from "react-icons/fa";
import medicineService from "../../services/medicineService";
import equipmentService from "../../services/equipmentService";
import { toast } from "react-toastify";

export default function InventoryTable({ data, type, isAdmin, onRefresh }) {

  const [adjustModal, setAdjustModal] = useState({ open: false, item: null, amount: "" });
  const [deleteId, setDeleteId] = useState(null);

  const openAdjust = (item) => {
    setAdjustModal({ open: true, item, amount: "" });
  };

  const closeAdjust = () => {
    setAdjustModal({ open: false, item: null, amount: "" });
  };

  const handleAdjustSubmit = async () => {
    const amount = parseInt(adjustModal.amount);
    if (isNaN(amount) || amount === 0) {
      toast.error("Please enter a valid non-zero amount");
      return;
    }
    try {
      if (type === "medicines") await medicineService.adjust(adjustModal.item.id, amount);
      else await equipmentService.adjust(adjustModal.item.id, amount);
      toast.success("Stock level updated");
      closeAdjust();
      onRefresh();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      if (type === "medicines") await medicineService.deleteMedicine(deleteId);
      else await equipmentService.deleteEquipment(deleteId);
      onRefresh();
      setDeleteId(null);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-muted small text-uppercase fw-bold">
            <tr>
              <th className="ps-4 py-3">Item Name</th>
              <th className="py-3">Stock Level</th>
              <th className="py-3">Location</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isLow = item.quantity <= item.threshold;
              return (
                <tr key={item.id}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{item.name}</div>
                    <div className="text-muted small">
                      {type === "medicines" ? `Batch: ${item.batchNumber}` : `S/N: ${item.serialNumber}`}
                    </div>
                  </td>

                  {/* STOCK + THRESHOLD */}
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Stock:</span>
                        <span className={`fw-bold ${isLow ? "text-danger" : "text-success"}`}>
                          {item.quantity}
                        </span>
                        {isLow && (
                          <span className="badge bg-danger-subtle text-danger rounded-pill" style={{ fontSize: "10px" }}>
                            Low
                          </span>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Threshold:</span>
                        <span className="fw-semibold text-warning">{item.threshold}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="text-muted small">
                      <FaMapMarkerAlt className="me-1 opacity-50" /> {item.location}
                    </span>
                  </td>

                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm rounded-pill overflow-hidden bg-white border">
                      <button
                        onClick={() => openAdjust(item)}
                        className="btn btn-sm btn-white px-3"
                        title="Adjust Stock"
                      >
                        <FaArrowUp className="text-primary me-1" size={10} />
                        <FaArrowDown className="text-primary" size={10} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="btn btn-sm btn-white px-3 border-start"
                        >
                          <FaTrash className="text-danger" size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADJUST STOCK MODAL */}
      {adjustModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "380px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <div>
                  <h5 className="fw-bold mb-0">Adjust Stock</h5>
                  <p className="text-muted small mb-0">{adjustModal.item?.name}</p>
                </div>
                <button className="btn-close" onClick={closeAdjust} />
              </div>

              <div className="modal-body px-4 py-3">
                <div className="d-flex gap-3 mb-3">
                  <div className="flex-grow-1 bg-light rounded-3 p-3 text-center">
                    <div className="text-muted small">Current Stock</div>
                    <div className="fw-bold fs-4 text-primary">{adjustModal.item?.quantity}</div>
                  </div>
                  <div className="flex-grow-1 bg-light rounded-3 p-3 text-center">
                    <div className="text-muted small">Threshold</div>
                    <div className="fw-bold fs-4 text-warning">{adjustModal.item?.threshold}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold">Quick Adjust</label>
                  <div className="d-flex flex-wrap gap-2">
                    {[-10, -5, -1, +1, +5, +10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`btn btn-sm rounded-pill ${val < 0 ? "btn-outline-danger" : "btn-outline-success"}`}
                        onClick={() => setAdjustModal((prev) => ({ ...prev, amount: String(val) }))}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label small text-muted fw-semibold">
                    Or enter custom amount
                  </label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    placeholder="e.g. 10 to add, -5 to subtract"
                    value={adjustModal.amount}
                    onChange={(e) => setAdjustModal((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                  {adjustModal.amount !== "" && !isNaN(parseInt(adjustModal.amount)) && (
                    <div className="mt-2 small text-muted">
                      New stock will be:{" "}
                      <strong className={
                        adjustModal.item?.quantity + parseInt(adjustModal.amount) <= adjustModal.item?.threshold
                          ? "text-danger" : "text-success"
                      }>
                        {adjustModal.item?.quantity + parseInt(adjustModal.amount)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-0 px-4 pb-4 pt-0">
                <button className="btn btn-light rounded-pill px-4" onClick={closeAdjust}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleAdjustSubmit}
                  disabled={!adjustModal.amount || adjustModal.amount === "0"}
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "360px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 px-4 pt-4 pb-0">
                <h5 className="fw-bold">🗑 Delete Item</h5>
                <button className="btn-close" onClick={() => setDeleteId(null)} />
              </div>
              <div className="modal-body px-4 py-3 text-muted">
                Are you sure you want to permanently delete this item? This action cannot be undone.
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-0">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger rounded-pill px-4" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}