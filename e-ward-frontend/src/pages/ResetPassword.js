import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Invalid or missing token");

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success("Password updated! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Link expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f3f4f6" }}>
      <div className="card border-0 shadow-sm p-4 w-100" style={{ maxWidth: 400, borderRadius: '20px' }}>
        <h3 className="fw-bold text-center mb-2">New Password</h3>
        <p className="text-center text-muted small mb-4">Please enter your new secure password.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">NEW PASSWORD</label>
            <input
              type="password"
              className="form-control border-light-subtle py-2"
              style={{ borderRadius: '10px', backgroundColor: "#f9fafb" }}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-success w-100 py-2 fw-bold" type="submit" disabled={loading} style={{ borderRadius: "10px" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}