import React from "react";
import PatientRow from "./PatientRow";

export default function PatientTable({
  patients,
  onEdit,
  onDelete,
  onTransfer,
  onReport,    
  onOpenUpdates

}) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>MRN</th>
            <th>Ward</th>
            <th>Admitted</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted py-4">
                No patients found
              </td>
            </tr>
          ) : (
            patients.map((p) => (
              <PatientRow
                key={p.id}
                patient={p}
                onEdit={onEdit}
                onDelete={onDelete}
                onTransfer={onTransfer}
                onReport={onReport}           
                onOpenUpdates={onOpenUpdates}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
