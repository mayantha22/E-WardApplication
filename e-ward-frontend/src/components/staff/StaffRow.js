import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

export default function StaffRow({ staff, isAdmin, onEdit, onDelete }) {
  return (
    <tr className="hover-row align-middle">
      <td className="ps-4">
        <div className="d-flex align-items-center">
          <div className="avatar-sm bg-primary-subtle text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold" style={{width: '38px', height: '38px'}}>
            {staff.fullName?.charAt(0)}
          </div>
          <span className="fw-bold text-dark">{staff.fullName}</span>
        </div>
      </td>
      <td>
        <div className="fw-medium text-secondary">{staff.employeeNumber || "N/A"}</div>
        <div className="small text-muted">{staff.designation}</div>
      </td>
      <td>
        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
          {staff.ward || "General"}
        </span>
      </td>
      <td>
        <div className="small text-dark"><FaEnvelope className="me-2 opacity-50"/>{staff.email}</div>
        <div className="small text-muted"><FaPhone className="me-2 opacity-50"/>{staff.phone}</div>
      </td>
      
      <td className="pe-4 text-end">
        <div className="d-flex gap-2 justify-content-end">
          {/* Profile Link */}
          <Link
            to={`/staff/profile/${staff.id}`}
            className="btn btn-outline-info btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
            title="View Profile"
          >
            <FaUser size={12} />
          </Link>

          {isAdmin && (
            <>
              {/* Edit Button */}
              <button
                className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
                onClick={() => onEdit(staff)}
                title="Edit Staff"
              >
                <FaEdit size={12} />
              </button>

              {/* Delete Button */}
              <button
                className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
                onClick={() => onDelete(staff.id)}
                title="Remove Staff"
              >
                <FaTrash size={12} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}