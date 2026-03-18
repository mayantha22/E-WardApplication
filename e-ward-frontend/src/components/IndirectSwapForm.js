import React, { useEffect, useState } from "react";
import rosterService from "../services/rosterService";
import swapService from "../services/swapService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const IndirectSwapForm = ({ staffId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [rosters, setRosters] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [selectedOriginal, setSelectedOriginal] = useState(null);
  const [preferredSlots, setPreferredSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRosters = async () => {
      try {
        const data = await rosterService.getAll();
        const allRosters = data.data || data;
        setRosters(Array.isArray(allRosters) ? allRosters : []);
      } catch (err) {
        toast.error("Failed to load roster");
      }
    };
    fetchRosters();
  }, []);

  // Extract this staff member's current slots from the roster
  useEffect(() => {
    if (!rosters.length || !staffId) return;
    const slots = [];
    rosters.forEach(roster => {
      const data = roster.data || {};
      Object.entries(data).forEach(([date, shifts]) => {
        ["morning", "evening", "night"].forEach(shift => {
          const list = shifts[shift] || [];
          const isAssigned = list.some(s => s.id === staffId || s.id === Number(staffId));
          if (isAssigned) slots.push({ date, shift, rosterId: roster.id });
        });
      });
    });
    setMySlots(slots);
  }, [rosters, staffId]);

  // All available slots in the roster (for preferred selection)
  const allAvailableSlots = [];
  rosters.forEach(roster => {
    const data = roster.data || {};
    Object.entries(data).forEach(([date, shifts]) => {
      ["morning", "evening", "night"].forEach(shift => {
        // Exclude slots the user is already assigned to
        const alreadyMine = mySlots.some(s => s.date === date && s.shift === shift);
        if (!alreadyMine) {
          allAvailableSlots.push({ date, shift });
        }
      });
    });
  });

  // Sort by date
  allAvailableSlots.sort((a, b) => a.date.localeCompare(b.date));

  const togglePreferredSlot = (date, shift) => {
    const key = `${date}_${shift}`;
    setPreferredSlots(prev => {
      const exists = prev.find(s => `${s.date}_${s.shift}` === key);
      if (exists) return prev.filter(s => `${s.date}_${s.shift}` !== key);
      return [...prev, { date, shift }];
    });
  };

  const isSelected = (date, shift) =>
    preferredSlots.some(s => s.date === date && s.shift === shift);

  const handleSubmit = async () => {
    if (!selectedOriginal) return toast.error("Please select your duty to swap");
    if (preferredSlots.length === 0) return toast.error("Please select at least one preferred slot");
    if (!reason.trim()) return toast.error("Please provide a reason");

    setLoading(true);
    try {
      await swapService.indirectRequest({
        requesterStaffId: staffId,
        originalShiftDate: selectedOriginal.date,
        originalShift: selectedOriginal.shift,
        requestedShiftDate: null,
        requestedShift: null,
        reason,
        requestMeta: {
          preferredSlots // [{ date, shift }, ...]
        }
      });
      toast.success("Indirect swap request submitted!");
      onSuccess?.();
    } catch (err) {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <h5 className="mb-3">Indirect Swap Request</h5>

      {/* STEP 1: Select your current duty to give up */}
      <div className="mb-4">
        <label className="form-label fw-bold">Step 1: Select your duty to swap away</label>
        {mySlots.length === 0 ? (
          <p className="text-muted">No assigned duties found in the current roster.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {mySlots.map((slot, i) => (
              <button
                key={i}
                className={`btn btn-sm ${selectedOriginal?.date === slot.date && selectedOriginal?.shift === slot.shift ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setSelectedOriginal(slot)}
              >
                {slot.date} — {slot.shift}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STEP 2: Select preferred slots */}
      <div className="mb-4">
        <label className="form-label fw-bold">
          Step 2: Select preferred slots you can work
          <span className="text-muted fw-normal ms-2">(select multiple)</span>
        </label>
        {allAvailableSlots.length === 0 ? (
          <p className="text-muted">No available slots found.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {allAvailableSlots.map((slot, i) => (
              <button
                key={i}
                className={`btn btn-sm ${isSelected(slot.date, slot.shift) ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => togglePreferredSlot(slot.date, slot.shift)}
              >
                {slot.date} — {slot.shift}
              </button>
            ))}
          </div>
        )}
        {preferredSlots.length > 0 && (
          <div className="mt-2 text-muted small">
            Selected: {preferredSlots.map(s => `${s.date} ${s.shift}`).join(", ")}
          </div>
        )}
      </div>

      {/* STEP 3: Reason */}
      <div className="mb-4">
        <label className="form-label fw-bold">Step 3: Reason</label>
        <textarea
          className="form-control"
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Why do you need this swap?"
        />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default IndirectSwapForm;