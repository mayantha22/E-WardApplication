import React, { useEffect, useState, useCallback } from "react";
import medicineService from "../services/medicineService";
import equipmentService from "../services/equipmentService";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { FaCapsules, FaStethoscope, FaPlus, FaSearch, FaBoxOpen, FaExclamationTriangle, FaCheckCircle, FaChartBar } from "react-icons/fa";

import InventoryTable from "../components/inventory/InventoryTable";
import InventoryModal from "../components/inventory/InventoryModal";
import ReportButtons from "../components/inventory/ReportButtons";

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("medicines");
  const [medicines, setMedicines] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const loadData = useCallback(async () => {
    try {
      const [m, e] = await Promise.all([
        medicineService.getAll(),
        equipmentService.getAll(),
      ]);
      setMedicines(m);
      setEquipment(e);
    } catch (err) {
      toast.error("Failed to sync inventory");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentData = activeTab === "medicines" ? medicines : equipment;
  const filteredData = currentData.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STATS ---
  const totalMedicines = medicines.length;
  const totalEquipment = equipment.length;
  const lowMedicines = medicines.filter((m) => m.quantity <= m.threshold).length;
  const lowEquipment = equipment.filter((e) => e.quantity <= e.threshold).length;
  const healthyMedicines = totalMedicines - lowMedicines;
  const healthyEquipment = totalEquipment - lowEquipment;

  const summaryCards = activeTab === "medicines"
    ? [
        {
          label: "Total Medicines",
          value: totalMedicines,
          icon: <FaCapsules size={22} />,
          color: "primary",
          bgColor: "#e7f1ff",
        },
        {
          label: "Healthy Stock",
          value: healthyMedicines,
          icon: <FaCheckCircle size={22} />,
          color: "success",
          bgColor: "#d1e7dd",
        },
        {
          label: "Low Stock",
          value: lowMedicines,
          icon: <FaExclamationTriangle size={22} />,
          color: lowMedicines > 0 ? "danger" : "success",
          bgColor: lowMedicines > 0 ? "#f8d7da" : "#d1e7dd",
        },
        {
          label: "Stock Health",
          value: totalMedicines > 0
            ? `${Math.round((healthyMedicines / totalMedicines) * 100)}%`
            : "N/A",
          icon: <FaChartBar size={22} />,
          color: lowMedicines === 0 ? "success" : lowMedicines > totalMedicines / 2 ? "danger" : "warning",
          bgColor: lowMedicines === 0 ? "#d1e7dd" : lowMedicines > totalMedicines / 2 ? "#f8d7da" : "#fff3cd",
        },
      ]
    : [
        {
          label: "Total Equipment",
          value: totalEquipment,
          icon: <FaStethoscope size={22} />,
          color: "info",
          bgColor: "#cff4fc",
        },
        {
          label: "Healthy Stock",
          value: healthyEquipment,
          icon: <FaCheckCircle size={22} />,
          color: "success",
          bgColor: "#d1e7dd",
        },
        {
          label: "Low Stock",
          value: lowEquipment,
          icon: <FaExclamationTriangle size={22} />,
          color: lowEquipment > 0 ? "danger" : "success",
          bgColor: lowEquipment > 0 ? "#f8d7da" : "#d1e7dd",
        },
        {
          label: "Stock Health",
          value: totalEquipment > 0
            ? `${Math.round((healthyEquipment / totalEquipment) * 100)}%`
            : "N/A",
          icon: <FaChartBar size={22} />,
          color: lowEquipment === 0 ? "success" : lowEquipment > totalEquipment / 2 ? "danger" : "warning",
          bgColor: lowEquipment === 0 ? "#d1e7dd" : lowEquipment > totalEquipment / 2 ? "#f8d7da" : "#fff3cd",
        },
      ];

  return (
    <div className="container-fluid py-4 px-lg-5 bg-light min-vh-100">

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Inventory Control</h3>
          <p className="text-muted small mb-0">Monitor stock levels and asset distribution</p>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && <ReportButtons activeTab={activeTab} onPreview={loadData} />}
          {isAdmin && (
            <button
              className="btn btn-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus size={12} /> Add {activeTab === "medicines" ? "Medicine" : "Equipment"}
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: card.bgColor,
                    color: `var(--bs-${card.color})`,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <div className={`fw-bold fs-4 text-${card.color}`}>
                    {card.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOW STOCK ALERT BANNER */}
      {(activeTab === "medicines" ? lowMedicines : lowEquipment) > 0 && (
        <div className="alert alert-danger border-0 rounded-4 d-flex align-items-center gap-2 mb-4 shadow-sm">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>
            <strong>
              {activeTab === "medicines" ? lowMedicines : lowEquipment} item(s)
            </strong>{" "}
            {activeTab === "medicines" ? "in pharmacy are" : "in equipment are"} below
            the alert threshold and need restocking.
          </span>
        </div>
      )}

      {/* TAB + SEARCH */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <div className="nav nav-pills bg-light p-1 rounded-pill">
                <button
                  className={`nav-link rounded-pill w-50 d-flex align-items-center justify-content-center gap-2 ${activeTab === "medicines" ? "active shadow-sm" : "text-muted"}`}
                  onClick={() => { setActiveTab("medicines"); setSearchTerm(""); }}
                >
                  <FaCapsules /> Medicines
                  {lowMedicines > 0 && (
                    <span className="badge bg-danger ms-1" style={{ fontSize: "10px" }}>
                      {lowMedicines}
                    </span>
                  )}
                </button>
                <button
                  className={`nav-link rounded-pill w-50 d-flex align-items-center justify-content-center gap-2 ${activeTab === "equipment" ? "active shadow-sm" : "text-muted"}`}
                  onClick={() => { setActiveTab("equipment"); setSearchTerm(""); }}
                >
                  <FaStethoscope /> Equipment
                  {lowEquipment > 0 && (
                    <span className="badge bg-danger ms-1" style={{ fontSize: "10px" }}>
                      {lowEquipment}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="col-md-8">
              <div className="input-group bg-light rounded-pill px-3 py-1">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 shadow-none"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <InventoryTable
          data={filteredData}
          type={activeTab}
          isAdmin={isAdmin}
          onRefresh={loadData}
        />
      </div>

      {/* MODAL */}
      <InventoryModal
        isOpen={isModalOpen}
        type={activeTab}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}