import React, { useEffect, useState } from "react";
import rosterService from "../services/rosterService";
import staffService from "../services/staffService";
import swapService from "../services/swapService";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import AsyncSelect from "react-select/async";

export default function DutyRosterPage() {
  const { user } = useAuth();
  const [rosters, setRosters] = useState([]);
  const [editing, setEditing] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [ward, setWard] = useState("General");
  const [assignments, setAssignments] = useState([
    { date: "", morning: [], evening: [], night: [] },
  ]);

  const [expandedRosterIds, setExpandedRosterIds] = useState([]);
  const [staff, setStaff] = useState(null);

  const [availableTargetSlots, setAvailableTargetSlots] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapData, setSwapData] = useState({
    date: "",
    shift: "",
    toStaff: null,
    reason: "",
    requestedDate: "",
    requestedShift: "",
  });

  const [swapType, setSwapType] = useState("DIRECT");
  const [deleteModal, setDeleteModal] = useState({ show: false, rosterId: null, rosterName: "" });
  const [preferredSlots, setPreferredSlots] = useState([]);
  const [selectedPreferredDate, setSelectedPreferredDate] = useState("");

  useEffect(() => {
    load();
    fetchStaffData();
  }, [user]);

  async function fetchStaffData() {
    try {
      if (user?.id) {
        const data = await staffService.getByUserId(user.id);
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff info:", err);
    }
  }

  async function load() {
    try {
      const data = await rosterService.getAll();
      setRosters(data);
    } catch (err) {
      toast.error("Failed to load rosters");
    }
  }

  const loadStaffOptions = async (inputValue) => {
    try {
      const res = await staffService.search(inputValue);
      return res.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.role})`,
      }));
    } catch (err) {
      return [];
    }
  };

  // const handleTargetStaffChange = async (selectedOption) => {
  //   setSwapData({ ...swapData, toStaff: selectedOption, requestedDate: "", requestedShift: "" });
  //   setAvailableTargetSlots([]);
  //   if (selectedOption) {
  //     try {
  //       const res = await swapService.getStaffSlots(month, year, selectedOption.value);
  //       const slots = res.data || res;
  //       if (Array.isArray(slots)) {
  //         setAvailableTargetSlots(slots);
  //       } else {
  //         setAvailableTargetSlots([]);
  //       }
  //     } catch (err) {
  //       setAvailableTargetSlots([]);
  //       toast.error("Could not fetch target staff's duties.");
  //     }
  //   }
  // };

//   

const handleTargetStaffChange = async (selectedOption) => {
  setSwapData({ ...swapData, toStaff: selectedOption, requestedDate: "", requestedShift: "" });
  setAvailableTargetSlots([]);

  if (selectedOption) {
    try {
      // ✅ Find roster that actually contains swapData.date
      const matchingRoster = rosters.find(
        (r) => r.data && Object.keys(r.data).includes(swapData.date)
      );

      console.log("matchingRoster:", matchingRoster); // should now find it

      if (!matchingRoster) {
        toast.error("No roster found containing your shift date.");
        return;
      }

      const res = await swapService.getStaffSlots(matchingRoster.id, year, selectedOption.value);
      const slots = res.data || res;
      setAvailableTargetSlots(Array.isArray(slots) ? slots : []);
    } catch (err) {
      setAvailableTargetSlots([]);
      toast.error("Could not fetch target staff's duties.");
    }
  }
};

  function handleAssignmentChange(index, field, value) {
    const copy = [...assignments];
    copy[index][field] = value;
    setAssignments(copy);
  }

  function addRow() {
    setAssignments([...assignments, { date: "", morning: [], evening: [], night: [] }]);
  }

  function removeRow(index) {
    setAssignments(assignments.filter((_, i) => i !== index));
  }

  async function save() {
    if (user?.role !== "ADMIN") return;
    try {
      const data = {};
      assignments.forEach((a) => {
        if (a.date) {
          data[a.date] = {
            morning: a.morning.map((m) => ({ id: m.value, name: m.label })),
            evening: a.evening.map((e) => ({ id: e.value, name: e.label })),
            night: a.night.map((n) => ({ id: n.value, name: n.label })),
          };
        }
      });
      if (editing) {
        await rosterService.update(editing.id, { month, year, ward, data });
        toast.success("Roster updated");
      } else {
        await rosterService.create({ month, year, ward, data });
        toast.success("Roster created");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error("Save failed");
    }
  }

  function edit(r) {
    if (user?.role !== "ADMIN") return;
    setEditing(r);
    setMonth(r.month);
    setYear(r.year);
    setWard(r.ward);
    const arr = Object.entries(r.data || {}).map(([date, shifts]) => ({
      date,
      morning: (shifts.morning || []).map((m) => ({ value: m.id, label: m.name })),
      evening: (shifts.evening || []).map((e) => ({ value: e.id, label: e.name })),
      night: (shifts.night || []).map((n) => ({ value: n.id, label: n.name })),
    }));
    setAssignments(arr.length ? arr : [{ date: "", morning: [], evening: [], night: [] }]);
  }

  function remove(r) {
  if (user?.role !== "ADMIN") return;
  setDeleteModal({ show: true, rosterId: r.id, rosterName: `${r.ward} — ${r.month}/${r.year}` });
}

  async function confirmDelete() {
    try {
      await rosterService.deleteRoster(deleteModal.rosterId);
      setDeleteModal({ show: false, rosterId: null, rosterName: "" });
      load();
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  function resetForm() {
    setEditing(null);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setWard("General");
    setAssignments([{ date: "", morning: [], evening: [], night: [] }]);
  }

  function toggleRoster(id) {
    setExpandedRosterIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  function openSwapModal(date, shift) {
    setSwapData({ date, shift, toStaff: null, reason: "", requestedDate: "", requestedShift: "" });
    setAvailableTargetSlots([]);
    setPreferredSlots([]);
    setSelectedPreferredDate("");
    setSwapType("DIRECT");
    setShowSwapModal(true);
  }

  function togglePreferredSlot(date, shift) {
    const key = `${date}_${shift}`;
    setPreferredSlots((prev) => {
      const exists = prev.some((s) => `${s.date}_${s.shift}` === key);
      return exists
        ? prev.filter((s) => `${s.date}_${s.shift}` !== key)
        : [...prev, { date, shift }];
    });
  }

  function isShiftSelected(date, shift) {
    return preferredSlots.some((s) => s.date === date && s.shift === shift);
  }

  // Get unique dates from roster, excluding user's current slot date+shift
  function getAvailableDatesForIndirect() {
    const dates = new Set();
    rosters.forEach((roster) => {
      Object.entries(roster.data || {}).forEach(([date, shifts]) => {
        ["morning", "evening", "night"].forEach((shift) => {
          if (date === swapData.date && shift === swapData.shift) return;
          dates.add(date);
        });
      });
    });
    return [...dates].sort();
  }

  // Get available shifts for a specific date
  function getShiftsForDate(date) {
    const shifts = new Set();
    rosters.forEach((roster) => {
      const dayData = roster.data?.[date];
      if (!dayData) return;
      ["morning", "evening", "night"].forEach((shift) => {
        if (date === swapData.date && shift === swapData.shift) return;
        if (dayData[shift]) shifts.add(shift);
      });
    });
    return [...shifts];
  }

  async function submitSwapRequest() {
    try {
      if (!swapData.reason || !swapData.date || !swapData.shift) {
        toast.error("Please fill required fields.");
        return;
      }
      if (swapType !== "INDIRECT" && (!swapData.requestedDate || !swapData.requestedShift)) {
        toast.error("Please select a duty slot from the target staff member.");
        return;
      }
      if (swapType === "INDIRECT" && preferredSlots.length === 0) {
        toast.error("Please select at least one preferred slot.");
        return;
      }

      const payload = {
        requesterStaffId: staff?.id,
        originalShiftDate: swapData.date,
        originalShift: swapData.shift,
        requestedShiftDate: swapType !== "INDIRECT" ? swapData.requestedDate : null,
        requestedShift: swapType !== "INDIRECT" ? swapData.requestedShift : null,
        reason: swapData.reason,
        targetStaffId: swapData.toStaff?.value || null,
        requestMeta: swapType === "INDIRECT" ? { preferredSlots } : null,
      };

      if (swapType === "DIRECT") await swapService.directSwap(payload);
      else if (swapType === "ADMIN") await swapService.adminRequest(payload);
      else await swapService.indirectRequest(payload);

      toast.success("Swap request submitted");
      setShowSwapModal(false);
    } catch (err) {
      toast.error("Failed to submit request");
    }
  }

  const availableDates = getAvailableDatesForIndirect();
  const shiftsForSelectedDate = selectedPreferredDate ? getShiftsForDate(selectedPreferredDate) : [];

  return (
    <div className="container mt-3">
      <h3>Duty Roster Management</h3>

      {staff && (
        <div className="alert alert-info p-2">
          Logged-in: <strong>{staff.name}</strong>
        </div>
      )}

      {/* ADMIN PANEL */}
      {user?.role === "ADMIN" && (
        <div className="card p-3 mb-4 shadow-sm bg-light">
          <h5>{editing ? `Editing Roster: ${editing.ward}` : "Create New Roster"}</h5>
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <label className="form-label">Month</label>
              <input type="number" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ward</label>
              <input type="text" className="form-control" value={ward} onChange={(e) => setWard(e.target.value)} />
            </div>
          </div>

          <h6>Assignments</h6>
          {assignments.map((a, idx) => (
            <div key={idx} className="border p-2 mb-2 rounded bg-white">
              <div className="row g-2 align-items-end">
                <div className="col-md-2">
                  <label className="small">Date</label>
                  <input type="date" className="form-control form-control-sm" value={a.date} onChange={(e) => handleAssignmentChange(idx, "date", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="small">Morning</label>
                  <AsyncSelect isMulti cacheOptions loadOptions={loadStaffOptions} defaultOptions value={a.morning} onChange={(v) => handleAssignmentChange(idx, "morning", v)} />
                </div>
                <div className="col-md-3">
                  <label className="small">Evening</label>
                  <AsyncSelect isMulti cacheOptions loadOptions={loadStaffOptions} defaultOptions value={a.evening} onChange={(v) => handleAssignmentChange(idx, "evening", v)} />
                </div>
                <div className="col-md-3">
                  <label className="small">Night</label>
                  <AsyncSelect isMulti cacheOptions loadOptions={loadStaffOptions} defaultOptions value={a.night} onChange={(v) => handleAssignmentChange(idx, "night", v)} />
                </div>
                <div className="col-md-1">
                  <button className="btn btn-sm btn-danger" onClick={() => removeRow(idx)}>×</button>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2">
            <button className="btn btn-sm btn-secondary me-2" onClick={addRow}>+ Add Date</button>
            <button className="btn btn-sm btn-primary" onClick={save}>{editing ? "Update Roster" : "Save Roster"}</button>
            {editing && <button className="btn btn-sm btn-link" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </div>
      )}

      {/* Roster Display */}
      <div className="card p-3 shadow-sm">
        <h5>Existing Rosters</h5>
        {rosters.map((r) => {
          const isExpanded = expandedRosterIds.includes(r.id);
          return (
            <div key={r.id} className="border rounded mb-2 p-2 bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div onClick={() => toggleRoster(r.id)} style={{ cursor: "pointer", flex: 1 }}>
                  <strong>{r.ward} — {r.month}/{r.year}</strong>
                  <span className="ms-2">{isExpanded ? "▲" : "▼"}</span>
                </div>
                {user?.role === "ADMIN" && (
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(r)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(r)}>Delete</button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <table className="table table-sm mt-2 bg-white">
                  <thead>
                    <tr><th>Date</th><th>Morning</th><th>Evening</th><th>Night</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.data || {}).map(([date, shifts]) => (
                      <tr key={date}>
                        <td>{date}</td>
                        {["morning", "evening", "night"].map((shift) => (
                          <td key={shift}>
                            {(shifts[shift] || []).map((s) => (
                              <div key={s.id} className="d-flex justify-content-between mb-1 small">
                                <span>{s.name}</span>
                                {user?.role === "STAFF" && s.id === staff?.id && (
                                  <button
                                    className="btn btn-xs btn-outline-success py-0 px-1"
                                    style={{ fontSize: "10px" }}
                                    onClick={() => openSwapModal(date, shift)}
                                  >
                                    Swap
                                  </button>
                                )}
                              </div>
                            ))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      {/* SWAP MODAL */}
      {showSwapModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Duty Swap</h5>
                <button type="button" className="btn-close" onClick={() => setShowSwapModal(false)}></button>
              </div>

              <div className="modal-body">
                <p><strong>Your Duty:</strong> {swapData.date} ({swapData.shift})</p>

                {/* SWAP TYPE */}
                <label className="form-label">Swap Type</label>
                <div className="btn-group w-100 mb-3">
                  {["DIRECT", "ADMIN", "INDIRECT"].map((type) => (
                    <button
                      key={type}
                      className={`btn ${swapType === type ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setSwapType(type);
                        setPreferredSlots([]);
                        setSelectedPreferredDate("");
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* DIRECT / ADMIN */}
                {swapType !== "INDIRECT" && (
                  <>
                    <label className="form-label">Swap With:</label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadStaffOptions}
                      defaultOptions
                      value={swapData.toStaff}
                      onChange={handleTargetStaffChange}
                    />
                    {swapData.toStaff && (
                      <div className="mt-3">
                        <label className="form-label">Choose their duty to take:</label>
                        {availableTargetSlots.length > 0 ? (
                          <select
                            className="form-select"
                            onChange={(e) => {
                              const slot = availableTargetSlots[e.target.value];
                              if (slot) setSwapData({ ...swapData, requestedDate: slot.date, requestedShift: slot.shift });
                            }}
                          >
                            <option value="">-- Choose Slot --</option>
                            {availableTargetSlots.map((slot, index) => (
                              <option key={index} value={index}>
                                {slot.date} | {slot.shift.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-danger small">No duties found for this person this month.</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* INDIRECT: date dropdown + shift checkboxes */}
                {swapType === "INDIRECT" && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Preferred Slots I Can Work</label>

                    {/* Step 1: Date dropdown */}
                    <select
                      className="form-select mb-3"
                      value={selectedPreferredDate}
                      onChange={(e) => setSelectedPreferredDate(e.target.value)}
                    >
                      <option value="">-- Select a date --</option>
                      {availableDates.map((date, i) => (
                        <option key={i} value={date}>{date}</option>
                      ))}
                    </select>

                    {/* Step 2: Shift checkboxes for selected date */}
                    {selectedPreferredDate && (
                      <div className="border rounded p-3 mb-3 bg-light">
                        <p className="small text-muted mb-2">
                          Select shifts for <strong>{selectedPreferredDate}</strong>:
                        </p>
                        <div className="d-flex gap-4">
                          {shiftsForSelectedDate.length > 0 ? (
                            shiftsForSelectedDate.map((shift) => (
                              <div key={shift} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`shift-${shift}`}
                                  checked={isShiftSelected(selectedPreferredDate, shift)}
                                  onChange={() => togglePreferredSlot(selectedPreferredDate, shift)}
                                />
                                <label className="form-check-label text-capitalize" htmlFor={`shift-${shift}`}>
                                  {shift}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted small mb-0">No shifts available for this date.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected summary as removable badges */}
                    {preferredSlots.length > 0 && (
                      <div>
                        <small className="text-muted d-block mb-1">
                          ✅ {preferredSlots.length} slot(s) selected:
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                          {preferredSlots.map((s, i) => (
                            <span key={i} className="badge bg-primary d-flex align-items-center gap-1 py-1 px-2">
                              {s.date} ({s.shift})
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-1"
                                style={{ fontSize: "8px" }}
                                onClick={() => togglePreferredSlot(s.date, s.shift)}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REASON */}
                <label className="form-label mt-2">Reason:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={swapData.reason}
                  onChange={(e) => setSwapData({ ...swapData, reason: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSwapModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitSwapRequest}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

{/*DELETE POPOUP*/}
      {deleteModal.show && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "380px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 px-4 pt-4 pb-0">
                <h5 className="fw-bold">🗑 Delete Roster</h5>
                <button className="btn-close" onClick={() => setDeleteModal({ show: false })} />
              </div>
              <div className="modal-body px-4 py-3">
                <p className="text-muted mb-0">
                  Are you sure you want to delete{" "}
                  <strong className="text-dark">{deleteModal.rosterName}</strong>?
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

    </div>
  );
}