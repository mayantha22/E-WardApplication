import React, { useState } from "react";
import swapService from "../services/swapService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SwapRequestItem = ({ request, refresh, activeTab, currentUserId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAction = async (type) => {
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
      const msg = err?.response?.data?.message
        || err?.response?.data
        || err?.message
        || "Action failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  //const preferredSlots = request.requestMeta?.preferredSlots || [];

 const preferredSlots = request.requestMeta?.preferredSlots 
  || request.preferredSlots  // sometimes nested differently
  || [];

  // Hide action buttons if viewing own sent requests
  const showActions =
    (request.peerApprovalStatus === "PENDING" || request.adminStatus === "PENDING") &&
    activeTab !== "submitted";

  return (
    <div className="swap-card border p-3 mb-3 shadow-sm rounded bg-white">

      {/* TYPE BADGE */}
      <p>
        <strong>Type:</strong>{" "}
        <span className={`badge ${
          request.requestType === "DIRECT" ? "bg-info text-dark" :
          request.requestType === "INDIRECT" ? "bg-warning text-dark" :
          "bg-secondary"
        }`}>
          {request.requestType}
        </span>
      </p>

      {/* REQUESTER & TARGET */}
      <p><strong>Requester:</strong> {request.requesterName || "Unknown"}</p>
      {request.requestType !== "INDIRECT" && (
        <p><strong>Target:</strong> {request.targetName || "-"}</p>
      )}

      <hr />

      {/* ORIGINAL DUTY */}
      <p>
        <strong>Original Duty:</strong> {request.originalShiftDate} ({request.originalShift})
      </p>

      {/* REQUESTED DUTY or PREFERRED SLOTS */}
      {request.requestType !== "INDIRECT" ? (
        <p>
          <strong>Requested Duty:</strong> {request.requestedShiftDate} ({request.requestedShift})
        </p>
      ) : (
        <div className="mb-2">
          <strong>Preferred Slots:</strong>{" "}
          {preferredSlots.length > 0 ? (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {preferredSlots.map((s, i) => (
                <span key={i} className="badge bg-primary">
                  {s.date} — {s.shift}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted ms-1">No preferences specified</span>
          )}
        </div>
      )}

      {/* STATUS */}
      <p>
        <strong>Status:</strong>{" "}
        {request.adminStatus === "PENDING" ? "⏳ Pending Admin" :
         request.adminStatus === "AUTO_APPLIED" ? "✅ Applied" :
         request.adminStatus === "REJECTED" ? "❌ Rejected" :
         request.adminStatus}
      </p>

      {/* PEER STATUS - only for DIRECT */}
      {request.requestType === "DIRECT" && request.peerApprovalStatus && (
        <p>
          <strong>Peer Status:</strong>{" "}
          {request.peerApprovalStatus === "PENDING" ? "⏳ Awaiting peer" :
           request.peerApprovalStatus === "APPROVED" ? "✅ Peer approved" :
           request.peerApprovalStatus === "REJECTED" ? "❌ Peer rejected" :
           request.peerApprovalStatus}
        </p>
      )}

      {/* REASON */}
      <p><strong>Reason:</strong> {request.reason || "-"}</p>

      {/* ACTION BUTTONS - hidden for submitted tab */}
      {showActions && (
        <div className="mt-3">
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() => handleAction("approve")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleAction("reject")}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default SwapRequestItem;