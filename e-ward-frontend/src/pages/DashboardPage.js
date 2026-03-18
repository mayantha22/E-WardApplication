import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import medicineService from "../services/medicineService";
import equipmentService from "../services/equipmentService";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    lowMedicines: 0,
    lowEquipment: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [lowMedicineList, setLowMedicineList] = useState([]);
  const [lowEquipmentList, setLowEquipmentList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    load();
    return () => clearInterval(timer);
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [patients, medicines, equipments, notifications] = await Promise.all([
        patientService.getAll(),
        medicineService.getAll(),
        equipmentService.getAll(),
        user ? notificationService.getForUser(user.id) : Promise.resolve([]),
      ]);

      const lowMeds = medicines.filter((m) => m.quantity <= m.threshold);
      const lowEquip = equipments.filter((e) => e.quantity <= e.threshold);

      setStats({
        totalPatients: patients.length,
        lowMedicines: lowMeds.length,
        lowEquipment: lowEquip.length,
      });

      setLowMedicineList(lowMeds.slice(0, 4));
      setLowEquipmentList(lowEquip.slice(0, 4));

      // Recent 5 unread notifications
      const unread = notifications
        .filter((n) => !n.isRead)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentNotifications(unread);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      SWAP_REQUEST: "🔄",
      SWAP_APPLIED: "✅",
      SWAP_REJECTED: "❌",
      LOW_STOCK: "📦",
      PATIENT_TRANSFER: "🏥",
      DUTY_CHANGE_DECISION: "📋",
    };
    return icons[type] || "🔔";
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const unreadCount = recentNotifications.length;

  return (
    <div className="dashboard-wrapper pb-5">

      {/* HERO */}
      <div
        className="text-white mb-4 p-5 rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          background: `linear-gradient(45deg, rgba(13, 110, 253, 0.95), rgba(13, 202, 240, 0.8)), 
                       url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <p className="mb-1 opacity-75 text-uppercase small fw-bold">{getGreeting()}</p>
            <h1 className="fw-bold display-5 mb-2">
              {user?.fullName || user?.username || "User"} 👋
            </h1>
            <p className="lead opacity-75 mb-0">
              {stats.lowMedicines + stats.lowEquipment > 0 ? (
                <>
                  ⚠️ You have{" "}
                  <strong>{stats.lowMedicines + stats.lowEquipment}</strong>{" "}
                  inventory alerts and{" "}
                  <strong>{unreadCount}</strong> unread notifications.
                </>
              ) : (
                "Everything looks good today. MediCore is running smoothly."
              )}
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <h2 className="mb-0 fw-light display-4">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </h2>
            <p className="opacity-75 text-uppercase small">
              {currentTime.toLocaleDateString(undefined, {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div
            className="card h-100 border-0 shadow-sm p-4 text-center"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/patients")}
          >
            <div
              className="rounded-circle mx-auto mb-3 bg-primary-subtle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-people-fill fs-3 text-primary"></i>
            </div>
            <h6 className="text-uppercase text-muted fw-bold small">Active Patients</h6>
            <h2 className="display-6 fw-bold text-primary">{stats.totalPatients}</h2>
            <small className="text-muted">Click to view</small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card h-100 border-0 shadow-sm p-4 text-center border-bottom border-warning border-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/inventory")}
          >
            <div
              className="rounded-circle mx-auto mb-3 bg-warning-subtle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-capsule fs-3 text-warning"></i>
            </div>
            <h6 className="text-uppercase text-muted fw-bold small">Low Stock Medicines</h6>
            <h2 className="display-6 fw-bold text-warning">{stats.lowMedicines}</h2>
            <small className="text-muted">Click to view</small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card h-100 border-0 shadow-sm p-4 text-center border-bottom border-danger border-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/inventory")}
          >
            <div
              className="rounded-circle mx-auto mb-3 bg-danger-subtle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-tools fs-3 text-danger"></i>
            </div>
            <h6 className="text-uppercase text-muted fw-bold small">Equipment Alerts</h6>
            <h2 className="display-6 fw-bold text-danger">{stats.lowEquipment}</h2>
            <small className="text-muted">Click to view</small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card h-100 border-0 shadow-sm p-4 text-center border-bottom border-primary border-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
          >
            <div
              className="rounded-circle mx-auto mb-3 bg-primary-subtle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-bell-fill fs-3 text-primary"></i>
            </div>
            <h6 className="text-uppercase text-muted fw-bold small">Unread Notifications</h6>
            <h2 className="display-6 fw-bold text-primary">{unreadCount}</h2>
            <small className="text-muted">Click to view</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">

        {/* RECENT NOTIFICATIONS */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
              <h6 className="fw-bold mb-0">🔔 Recent Notifications</h6>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/notifications")}
              >
                View All
              </button>
            </div>
            <div className="card-body p-0">
              {recentNotifications.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "32px" }}>✅</div>
                  <p className="mt-2 small">No unread notifications</p>
                </div>
              ) : (
                recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="d-flex align-items-start gap-3 p-3 border-bottom"
                    style={{ borderLeft: "3px solid #0d6efd" }}
                  >
                    <span style={{ fontSize: "20px" }}>{getNotificationIcon(n.type)}</span>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-dark">{n.message}</div>
                      <div className="small text-muted">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
              <h6 className="fw-bold mb-0">⚠️ Low Stock Alerts</h6>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => navigate("/inventory")}
              >
                View Inventory
              </button>
            </div>
            <div className="card-body p-0">
              {lowMedicineList.length === 0 && lowEquipmentList.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "32px" }}>✅</div>
                  <p className="mt-2 small">All stock levels are healthy</p>
                </div>
              ) : (
                <>
                  {lowMedicineList.map((m) => (
                    <div
                      key={m.id}
                      className="d-flex align-items-center gap-3 p-3 border-bottom"
                      style={{ borderLeft: "3px solid #ffc107" }}
                    >
                      <span style={{ fontSize: "20px" }}>💊</span>
                      <div className="flex-grow-1">
                        <div className="small fw-semibold">{m.name}</div>
                        <div className="small text-muted">
                          Stock: <span className="text-warning fw-bold">{m.quantity}</span> / Threshold: {m.threshold}
                        </div>
                      </div>
                      <span className="badge bg-warning text-dark">Low</span>
                    </div>
                  ))}
                  {lowEquipmentList.map((e) => (
                    <div
                      key={e.id}
                      className="d-flex align-items-center gap-3 p-3 border-bottom"
                      style={{ borderLeft: "3px solid #dc3545" }}
                    >
                      <span style={{ fontSize: "20px" }}>🔧</span>
                      <div className="flex-grow-1">
                        <div className="small fw-semibold">{e.name}</div>
                        <div className="small text-muted">
                          Stock: <span className="text-danger fw-bold">{e.quantity}</span> / Threshold: {e.threshold}
                        </div>
                      </div>
                      <span className="badge bg-danger">Critical</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="card shadow-sm border-0 p-4">
        <h5 className="fw-bold mb-4 text-center">Quick Actions</h5>
        <div className="row g-3 justify-content-center">
          {[
            { label: "Add New Patient", sub: "Register a new ward entry", icon: "bi-person-plus", color: "primary", path: "/patients" },
            { label: "View Duty Roster", sub: "Manage staff duty shifts", icon: "bi-calendar-week", color: "dark", path: "/roster" },
            { label: "Swap Requests", sub: "View pending swap requests", icon: "bi-arrow-left-right", color: "info", path: "/swap-requests" },
            { label: "Inventory", sub: "Check stock levels", icon: "bi-box-seam", color: "warning", path: "/inventory" },
          ].map((action) => (
            <div key={action.path} className="col-md-3 col-sm-6">
              <button
                onClick={() => navigate(action.path)}
                className={`btn btn-outline-${action.color} w-100 p-3 rounded-4 d-flex align-items-center gap-3`}
              >
                <i className={`bi ${action.icon} fs-3`}></i>
                <div className="text-start">
                  <span className="d-block fw-bold">{action.label}</span>
                  <small className="opacity-75">{action.sub}</small>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}