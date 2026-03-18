import React, { useEffect, useState } from "react";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { formatDateTime } from "../utils/helpers";

const TYPE_CONFIG = {
  SWAP_REQUEST: {
    label: "Swap Request",
    icon: "🔄",
    badgeClass: "bg-info text-dark",
    category: "swap",
  },
  SWAP_APPLIED: {
    label: "Swap Applied",
    icon: "✅",
    badgeClass: "bg-success",
    category: "swap",
  },
  SWAP_REJECTED: {
    label: "Swap Rejected",
    icon: "❌",
    badgeClass: "bg-danger",
    category: "swap",
  },
  LOW_STOCK: {          // ADD THIS
    label: "Low Stock",
    icon: "📦",
    badgeClass: "bg-warning text-dark",
    category: "inventory",
  },
  INVENTORY: {
    label: "Inventory",
    icon: "📦",
    badgeClass: "bg-warning text-dark",
    category: "inventory",
  },
  MEDICINE: {
    label: "Medicine",
    icon: "💊",
    badgeClass: "bg-warning text-dark",
    category: "inventory",
  },
  PATIENT_TRANSFER: {
    label: "Patient Transfer",
    icon: "🏥",
    badgeClass: "bg-primary",
    category: "patient",
  },
  DUTY_CHANGE_DECISION: {   // ADD THIS TOO - seen in your screenshot
    label: "Duty Change",
    icon: "📋",
    badgeClass: "bg-secondary",
    category: "other",
  },
};

function getConfig(type) {
  return TYPE_CONFIG[type] || {
    label: type,
    icon: "🔔",
    badgeClass: "bg-secondary",
    category: "other",
  };
}

const TABS = [
  { key: "all",       label: "All" },
  { key: "swap",      label: "🔄 Swap" },
  { key: "inventory", label: "📦 Inventory & Medicine" },
  { key: "patient",   label: "🏥 Patient" },
  { key: "other",     label: "Other" },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    try {
      const data = await notificationService.getForUser(user.id);
      console.log("Notification types:", data.map(n => n.type)); // testing logs
      // Sort: unread first, then by date desc
      const sorted = [...data].sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotes(sorted);
    } catch (err) {
      toast.error("Failed to load notifications");
    }
  }

  async function markAsRead(n) {
    if (n.isRead) return;
    try {
      setLoadingId(n.id);
      await notificationService.markAsRead(n.id);
      // Optimistically update UI without full reload
      setNotes((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      toast.error("Failed to mark as read");
    } finally {
      setLoadingId(null);
    }
  }

  async function markAllAsRead() {
    const unread = notes.filter((n) => !n.isRead);
    if (unread.length === 0) return toast.info("All notifications are already read");
    try {
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));
      setNotes((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  }

  async function deleteNotification(e, id) {
  e.stopPropagation();
  try {
    await notificationService.deleteNotification(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  } catch (err) {
    toast.error("Failed to delete");
  }
}

  const filtered = notes.filter((n) => {
    if (activeTab === "all") return true;
    return getConfig(n.type).category === activeTab;
  });

  const unreadCount = notes.filter((n) => !n.isRead).length;

  const tabUnreadCount = (tabKey) => {
    if (tabKey === "all") return unreadCount;
    return notes.filter(
      (n) => !n.isRead && getConfig(n.type).category === tabKey
    ).length;
  };

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2" style={{ fontSize: "14px" }}>
                {unreadCount}
              </span>
            )}
          </h3>
          <small className="text-muted">{notes.length} total notifications</small>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          ✓ Mark all as read
        </button>
      </div>

      {/* TABS */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {TABS.map((tab) => {
          const count = tabUnreadCount(tab.key);
          return (
            <button
              key={tab.key}
              className={`btn btn-sm ${activeTab === tab.key ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {count > 0 && (
                <span className="badge bg-danger ms-1">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div style={{ fontSize: "40px" }}>🔔</div>
              <p className="mt-2">No notifications here</p>
            </div>
          ) : (
            filtered.map((n) => {
              const config = getConfig(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n)}
                  style={{
                    cursor: n.isRead ? "default" : "pointer",
                    borderLeft: n.isRead ? "4px solid transparent" : "4px solid #0d6efd",
                    transition: "background 0.2s",
                  }}
                  className={`p-3 border-bottom d-flex align-items-start gap-3 ${
                    n.isRead ? "bg-light" : "bg-white"
                  } ${!n.isRead ? "notification-unread" : ""}`}
                >
                  {/* ICON */}
                  <div style={{ fontSize: "24px", minWidth: "32px", textAlign: "center" }}>
                    {config.icon}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge ${config.badgeClass}`} style={{ fontSize: "11px" }}>
                        {config.label}
                      </span>
                      {!n.isRead && (
                        <span className="badge bg-danger" style={{ fontSize: "10px" }}>
                          New
                        </span>
                      )}
                    </div>
                    <div className={`${n.isRead ? "text-muted" : "text-dark fw-semibold"}`}>
                      {n.message}
                    </div>
                    <div className="small text-muted mt-1">{formatDateTime(n.createdAt)}</div>
                  </div>

                 

                   {/* READ INDICATOR + DELETE */}
                  <div className="d-flex flex-column align-items-end gap-2" style={{ minWidth: "80px" }}>
                    {/* Read indicator */}
                    {loadingId === n.id ? (
                      <span className="spinner-border spinner-border-sm text-primary" />
                    ) : n.isRead ? (
                      <span className="text-success small fw-semibold">✓ Read</span>
                    ) : (
                      <span className="badge bg-primary" style={{ fontSize: "10px" }}>Unread</span>
                    )}

                    {/* Delete button */}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      style={{ fontSize: "12px", padding: "2px 8px" }}
                      onClick={(e) => deleteNotification(e, n.id)}
                      title="Delete notification"
                    >
                      🗑 Delete
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}