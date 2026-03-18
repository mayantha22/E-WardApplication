import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import notificationService from "../services/notificationService";

export default function TopNav() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.user) return;
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [auth.user]);

  async function fetchUnreadCount() {
    try {
      const data = await notificationService.getForUser(auth.user.id);
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      // silently fail - don't disrupt nav
    }
  }

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link px-3 ${isActive ? "text-primary fw-bold" : "text-secondary"}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
      <div className="container">
        {/* Brand */}
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <span
            className="bg-primary text-white p-2 rounded-3 me-2 d-flex align-items-center justify-content-center"
            style={{ width: "35px", height: "35px" }}
          >
            <i className="bi bi-heart-pulse-fill">M</i>
          </span>
          <span className="fw-bold fs-4 tracking-tight text-dark">
            Medi<span className="text-primary">Core</span>
          </span>
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            {auth.isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/staff">Staff</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/patients">Patients</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/inventory">Inventory</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/roster">Duty Roster</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/swap-requests">Swap Requests</NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {!auth.isAuthenticated ? (
              <NavLink className="btn btn-primary px-4 rounded-pill shadow-sm" to="/login">
                Sign in
              </NavLink>
            ) : (
              <>
                {/* NOTIFICATION BELL */}
                <NavLink
                  to="/notifications"
                  className="position-relative p-2 text-secondary text-decoration-none d-flex align-items-center gap-1"
                  style={({ isActive }) => ({
                    color: isActive ? "#0d6efd" : undefined,
                  })}
                >
                  {/* Bell icon */}
                  <span style={{ fontSize: "22px" }}>🔔</span>

                  {/* Unread count badge */}
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute badge bg-danger rounded-pill"
                      style={{
                        top: "0px",
                        right: "0px",
                        fontSize: "10px",
                        minWidth: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}

                  {/* Label visible on mobile */}
                  <span className="d-lg-none small">Notifications</span>
                </NavLink>

                <div
                  className="vr d-none d-lg-block mx-2 text-black-50"
                  style={{ height: "30px" }}
                />

                {/* User info */}
                <span className="d-none d-lg-flex align-items-center gap-2 text-secondary small">
                  <span
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "30px", height: "30px", fontSize: "13px" }}
                  >
                    {auth.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  {auth.user?.fullName || auth.user?.username}
                </span>

                <div
                  className="vr d-none d-lg-block mx-2 text-black-50"
                  style={{ height: "30px" }}
                />

                <button
                  className="btn btn-outline-danger px-4 rounded-pill"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}