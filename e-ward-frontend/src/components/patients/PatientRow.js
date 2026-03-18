import React from "react";
import { formatDateTime } from "../../utils/helpers";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaExchangeAlt, FaFileAlt, FaUser, FaNotesMedical } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is loaded

export default function PatientRow({ patient, onEdit, onDelete, onTransfer, onReport, onOpenUpdates }) {
  return (
    <tr className="hover-row">
      <td className="fw-medium">{patient.fullName}</td>
      <td>{patient.medicalRecordNumber}</td>
      <td>
        <span className="badge bg-info-subtle text-dark px-3 py-2">
          {patient.assignedWard}
        </span>
      </td>
      <td>{formatDateTime(patient.admissionDate)}</td>

      <td className="text-end">
        <div className="d-flex flex-wrap gap-2 justify-content-end">
          {/* Profile */}
          <Link
            to={`/patients/profile/${patient.id}`}
            className="btn btn-outline-success btn-sm rounded-circle"
            title="Profile"
          >
            <FaUser />
          </Link>

          {/* Edit */}
          <button
            className="btn btn-outline-primary btn-sm rounded-circle"
            onClick={() => onEdit(patient)}
            title="Edit"
          >
            <FaEdit />
          </button>

          {/* Transfer */}
          <button
            className="btn btn-outline-secondary btn-sm rounded-circle"
            onClick={() => onTransfer(patient)}
            title="Transfer"
          >
            <FaExchangeAlt />
          </button>

          {/* Delete */}
          <button
            className="btn btn-outline-danger btn-sm rounded-circle"
            onClick={() => onDelete(patient.id)}
            title="Delete"
          >
            <FaTrash />
          </button>

          {/* Report */}
          <button
            className="btn btn-outline-success btn-sm rounded-circle"
            onClick={() => onReport(patient.id)}
            title="Report"
          >
            <FaFileAlt />
          </button>

          {/* daily updatess */}
          <button
            className="btn btn-outline-info btn-sm rounded-circle"
            onClick={() => onOpenUpdates(patient)}
            title="Daily Updates"
          >
            <FaNotesMedical />
          </button>

        </div>
      </td>
    </tr>
  );
}
