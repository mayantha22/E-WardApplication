import React, { useState, useEffect } from "react";
import swapService from "../services/swapService";
import staffService from "../services/staffService";
import rosterService from "../services/rosterService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SwapRequestItem = ({ request, refresh, activeTab, currentUserId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showIndirectModal, setShowIndirectModal] = useState(false);
  const [targetStaff, setTargetStaff] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetShift, setTargetShift] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rosters, setRosters] = useState([]);

  const preferredSlots = request.requestMeta?.preferredSlots || request.preferredSlots || [];

  const showActions =
    (request.peerApprovalStatus === "PENDING" || request.adminStatus === "PENDING") &&
    activeTab !== "submitted";

  // Load staff and rosters when modal opens
  useEffect(() => {
    if (!showIndirectModal) return;
    staffService.getAll().then(data => setStaffList(Array.isArray(data) ? data : data.data || []));
    rosterService.getAll().then(data => setRosters(Array.isArray(data) ? data : data.data || []));
  }, [showIndirectModal]);

  // When target staff changes, load their slots
  const handleStaffChange = async (staffId) => {
    setTargetStaff(staffId);
    setTargetDate("");
    setTargetShift("");
    setAvailableSlots([]);
    if (!staffId) return;
    try {
      const matchingRoster = rosters.find(r =>
        r.data && Object.keys(r.data).some(date =>
          Object.entries(r.data[date] || {}).some(([shift, list]) =>
            list.some(s => String(s.id) === String(staffId))
          )
        )
      );
      if (matchingRoster) {
        const res = await swapService.getStaffSlots(matchingRoster.id, matchingRoster.year, staffId);
        const slots = res.data || res;
        setAvailableSlots(Array.isArray(slots) ? slots : []);
      }
    } catch {
      toast.error("Could not fetch staff slots");
    }
  };

  const handleAction = async (type) => {
    // For INDIRECT approval, show modal instead
    if (type === "approve" && user.role === "ADMIN" && request.requestType === "INDIRECT") {
      setShowIndirectModal(true);
      return;
    }
    try {
      setLoading(true);
      if (user.role === "ADMIN") {
        if (type === "approve") await swapService.adminApprove(request.id, user.id);
        else await swapService.adminReject(request.id, user.id);
      } else {
        if (type === "approve") await swapService.peerApprove(request.id, user.id);
        else await swapService.peerReject(request.id, user.id);
      }
      toast.success("Action successful!");
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Action failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleIndirectApprove = async () => {
    if (!targetDate || !targetShift) {
      toast.error("Please select a target date and shift");
      return;
    }
    try {
      setLoading(true);
      // First update the swap request with the assigned slot
      await swapService.assignIndirectSlot(request.id, {
        requestedShiftDate: targetDate,
        requestedShift: targetShift,
        targetStaffId: targetStaff || null,
      });
      // Then approve
      await swapService.adminApprove(request.id, user.id);
      toast.success("Indirect swap assigned and approved!");
      setShowIndirectModal(false);
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="swap-card border p-3 mb-3 shadow-sm rounded bg-white">
      {/* TYPE BADGE */}
      <p>
        <strong>Type:</strong>{" "}
        <span className={`badge ${
          request.requestType === "DIRECT" ? "bg-info text-dark" :
          request.requestType === "INDIRECT" ? "bg-warning text-dark" : "bg-secondary"
        }`}>{request.requestType}</span>
      </p>

      <p><strong>Requester:</strong> {request.requesterName || "Unknown"}</p>
      {request.requestType !== "INDIRECT" && (
        <p><strong>Target:</strong> {request.targetName || "-"}</p>
      )}
      <hr />
      <p><strong>Original Duty:</strong> {request.originalShiftDate} ({request.originalShift})</p>

      {request.requestType !== "INDIRECT" ? (
        <p><strong>Requested Duty:</strong> {request.requestedShiftDate} ({request.requestedShift})</p>
      ) : (
        <div className="mb-2">
          <strong>Preferred Slots:</strong>{" "}
          {preferredSlots.length > 0 ? (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {preferredSlots.map((s, i) => (
                <span key={i} className="badge bg-primary">{s.date} — {s.shift}</span>
              ))}
            </div>
          ) : (
            <span className="text-muted ms-1">No preferences specified</span>
          )}
        </div>
      )}

      <p>
        <strong>Status:</strong>{" "}
        {request.adminStatus === "PENDING" ? "⏳ Pending Admin" :
         request.adminStatus === "AUTO_APPLIED" ? "✅ Applied" :
         request.adminStatus === "REJECTED" ? "❌ Rejected" : request.adminStatus}
      </p>

      {request.requestType === "DIRECT" && request.peerApprovalStatus && (
        <p>
          <strong>Peer Status:</strong>{" "}
          {request.peerApprovalStatus === "PENDING" ? "⏳ Awaiting peer" :
           request.peerApprovalStatus === "APPROVED" ? "✅ Peer approved" :
           request.peerApprovalStatus === "REJECTED" ? "❌ Peer rejected" :
           request.peerApprovalStatus}
        </p>
      )}

      <p><strong>Reason:</strong> {request.reason || "-"}</p>

      {showActions && (
        <div className="mt-3">
          <button className="btn btn-primary btn-sm me-2" onClick={() => handleAction("approve")} disabled={loading}>
            {loading ? "Processing..." : request.requestType === "INDIRECT" && user.role === "ADMIN" ? "Assign & Approve" : "Approve"}
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => handleAction("reject")} disabled={loading}>
            Reject
          </button>
        </div>
      )}

      {/* INDIRECT ASSIGNMENT MODAL */}
      {showIndirectModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Indirect Swap</h5>
                <button className="btn-close" onClick={() => setShowIndirectModal(false)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Requester wants to swap away: <strong>{request.originalShiftDate} ({request.originalShift})</strong>
                </p>

                {/* Preferred slots hint */}
                {preferredSlots.length > 0 && (
                  <div className="alert alert-info p-2 small mb-3">
                    <strong>Preferred slots:</strong>{" "}
                    {preferredSlots.map(s => `${s.date} (${s.shift})`).join(", ")}
                  </div>
                )}

                {/* Target Staff (optional) */}
                <label className="form-label">Assign Target Staff (optional)</label>
                <select className="form-select mb-3" value={targetStaff} onChange={e => handleStaffChange(e.target.value)}>
                  <option value="">-- No specific staff --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
                  ))}
                </select>

                {/* Target Date */}
                <label className="form-label">Assign Target Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control mb-3"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                />

                {/* Target Shift */}
                <label className="form-label">Assign Target Shift <span className="text-danger">*</span></label>
                <select className="form-select" value={targetShift} onChange={e => setTargetShift(e.target.value)}>
                  <option value="">-- Select shift --</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowIndirectModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleIndirectApprove} disabled={loading}>
                  {loading ? "Processing..." : "Confirm & Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapRequestItem;