import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error("User not found with this email" || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f3f4f6" }}>
      <div className="card border-0 shadow-sm p-4 w-100" style={{ maxWidth: 400, borderRadius: '20px' }}>
        <h3 className="fw-bold text-center mb-2">Reset Password</h3>
        <p className="text-center text-muted small mb-4">Enter your email to receive a recovery link.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">EMAIL ADDRESS</label>
            <input
              type="email"
              className="form-control border-light-subtle py-2"
              style={{ borderRadius: '10px', backgroundColor: "#f9fafb" }}
              placeholder="name@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-100 py-2 fw-bold" type="submit" disabled={loading} style={{ borderRadius: "10px" }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-decoration-none small text-muted">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}