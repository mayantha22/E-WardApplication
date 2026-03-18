import React from "react";
import StaffRow from "./StaffRow";

export default function StaffTable({ staffList, isAdmin, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="bg-light">
          <tr>
            <th className="ps-4 py-3 border-0 text-muted small text-uppercase fw-bold">Name</th>
            <th className="py-3 border-0 text-muted small text-uppercase fw-bold">Designation</th>
            <th className="py-3 border-0 text-muted small text-uppercase fw-bold">Ward</th>
            <th className="py-3 border-0 text-muted small text-uppercase fw-bold">Contact</th>
            <th className="pe-4 py-3 border-0 text-muted small text-uppercase fw-bold text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <StaffRow 
              key={staff.id} 
              staff={staff} 
              isAdmin={isAdmin} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}