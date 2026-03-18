import React, { useState, useEffect, useRef } from "react";
import { FaExclamationTriangle, FaClipboardList, FaDownload } from "react-icons/fa";
import api from "../../services/api";
import medicineService from "../../services/medicineService";
import equipmentService from "../../services/equipmentService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

export default function ReportButtons({ activeTab }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- PDF GENERATION ENGINE ---
  const previewReport = async (generateCallback, fileName) => {
    try {
      toast.info("Generating report...");
      const doc = await generateCallback();
      if (!doc) return;

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      toast.success("Report Generated Successfully");
    } catch (err) {
      console.error("PDF_ERROR:", err);
      toast.error(`Failed: ${err.message}`);
    }
  };

  // --- SPECIFIC REPORT FUNCTIONS ---
  const previewMedicineReport = () => {
    previewReport(async () => {
      const res = await api.get("/medicines/report/low-stock");
      const data = res.data || res;
      if (!data || data.length === 0) throw new Error("No low stock medicines found");

      const doc = new jsPDF();
      doc.text("Low Stock Medicines Report", 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [["Name", "Batch", "Qty", "Threshold", "Location"]],
        body: data.map(m => [m.name, m.batchNumber, m.quantity, m.threshold, m.location]),
        headStyles: { fillColor: [13, 110, 253] }
      });
      return doc;
    }, "medicine_report.pdf");
  };

  const previewEquipmentReport = () => {
    previewReport(async () => {
      const res = await api.get("/equipment/report/low-stock");
      const data = res.data || res;
      if (!data || data.length === 0) throw new Error("No low stock equipment found");

      const doc = new jsPDF();
      doc.text("Low Stock Equipment Report", 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [["Name", "Serial No", "Qty", "Threshold", "Location"]],
        body: data.map(e => [e.name, e.serialNumber, e.quantity, e.threshold, e.location]),
        headStyles: { fillColor: [25, 135, 84] }
      });
      return doc;
    }, "equipment_report.pdf");
  };

  const previewFullReport = () => {
    previewReport(async () => {
      const [m, e] = await Promise.all([medicineService.getAll(), equipmentService.getAll()]);
      const doc = new jsPDF();
      doc.text("Full Inventory Audit", 14, 15);
      
      autoTable(doc, {
        startY: 25,
        head: [["Medicines", "Qty", "Location"]],
        body: m.map(item => [item.name, item.quantity, item.location]),
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Equipment", "Qty", "Location"]],
        body: e.map(item => [item.name, item.quantity, item.location]),
        headStyles: { fillColor: [108, 117, 125] }
      });
      return doc;
    }, "full_inventory.pdf");
  };

  return (
    <div className="dropdown" ref={menuRef} style={{ position: "relative" }}>
      <button 
        className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
        type="button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <FaDownload size={14}/> Export Reports
      </button>
      
      {showMenu && (
        <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3 mt-2 show" 
            style={{ display: "block", position: "absolute", right: 0, minWidth: "220px", zIndex: 1050 }}>
          
          <li><h6 className="dropdown-header text-uppercase small">Inventory Data</h6></li>
          
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" 
              onClick={() => { previewFullReport(); setShowMenu(false); }}>
              <FaClipboardList className="text-primary"/> Full Audit  
            </button>
          </li>

          <li><hr className="dropdown-divider" /></li>
          
          {activeTab === "medicines" ? (
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger py-2" 
                onClick={() => { previewMedicineReport(); setShowMenu(false); }}>
                <FaExclamationTriangle /> Low Stock Medicines
              </button>
            </li>
          ) : (
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger py-2" 
                onClick={() => { previewEquipmentReport(); setShowMenu(false); }}>
                <FaExclamationTriangle /> Low Stock Equipment
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}