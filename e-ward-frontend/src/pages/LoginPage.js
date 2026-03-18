import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    mode: "onBlur"
  });
  
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await auth.login(data.username, data.password);
      toast.success("Welcome to MediCore");
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" 
         style={{ backgroundColor: "#f3f4f6", fontFamily: "'Inter', sans-serif" }}>
      
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');`}
      </style>

      <div className="card border-0 shadow-sm p-4 w-100" style={{ maxWidth: 400, borderRadius: '20px' }}>
        
        {/* MediCore Branded Logo Section */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
          <div style={{ 
            backgroundColor: "#007bff", // Matching the blue in your logo
            width: "42px", 
            height: "42px", 
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            fontStyle: "italic"
          }}>
            M
          </div>
          <h2 className="mb-0 fw-bold" style={{ fontSize: "28px", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#212529" }}>Medi</span>
            <span style={{ color: "#007bff" }}>Core</span>
          </h2>
        </div>

        <p className="text-center text-muted small mb-4">Secure Access for Healthcare Professionals</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">USERNAME</label>
            <input
              type="text"
              className={`form-control border-light-subtle py-2 ${errors.username ? "is-invalid" : ""}`}
              style={{ borderRadius: '10px', backgroundColor: "#f9fafb" }}
              placeholder="Enter username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">PASSWORD</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control border-light-subtle py-2 ${errors.password ? "is-invalid" : ""}`}
                style={{ borderRadius: '10px 0 0 10px', backgroundColor: "#f9fafb" }}
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              <button 
                className="btn btn-light border-light-subtle" 
                style={{ borderRadius: '0 10px 10px 0', color: '#6c757d' }}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
          </div>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold" 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              backgroundColor: "#007bff", 
              border: "none", 
              borderRadius: "10px",
              boxShadow: "0 4px 6px -1px rgba(0, 123, 255, 0.2)"
            }}
          >
            {isSubmitting ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/forgot-password" size="sm" className="text-decoration-none small text-muted">
            forgot password
          </a>
        </div>
      </div>
    </div>
  );
}