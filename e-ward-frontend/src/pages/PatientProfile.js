import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import patientService from '../services/patientService';
import updateService from '../services/updateService';
import { toast } from 'react-toastify';
import { formatDateTime } from '../utils/helpers';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [updatesLoaded, setUpdatesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPatientProfile(); }, [id]);

  async function loadPatientProfile() {
    try {
      const response = await patientService.getById(id);
      setPatient(response);
    } catch (err) {
      toast.error("Failed to load patient profile.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDailyUpdates() {
    if (updatesLoaded) {
      setUpdatesLoaded(false);
      setUpdates([]);
      return;
    }
    try {
      const updatesData = await updateService.getByPatient(id);
      let finalUpdates = updatesData;
      if (updatesData && !Array.isArray(updatesData) && updatesData.data && Array.isArray(updatesData.data)) {
        finalUpdates = updatesData.data;
      }
      const updatesArray = Array.isArray(finalUpdates) ? finalUpdates : [];
      setUpdates(updatesArray);
      setUpdatesLoaded(true);
      if (updatesArray.length === 0) toast.info("No daily updates found for this patient.");
    } catch (err) {
      toast.error("Failed to load daily updates.");
      setUpdates([]);
    }
  }

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  const getStatusStyle = (status) => {
    const map = {
      'Admitted':    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      'Discharged':  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
      'Critical':    { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
      'Observation': { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
    };
    return map[status] || { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  if (loading) return <div style={styles.center}>Loading Patient Profile...</div>;
  if (!patient) return <div style={styles.center}>Patient not found.</div>;

  const statusStyle = getStatusStyle(patient.status);

  return (
    <div style={styles.page}>

      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Patient Profile</h2>
          <p style={styles.pageSubtitle}>View patient details and clinical history</p>
        </div>
        <Link to="/patients" style={styles.backBtn}>← Back to Patient List</Link>
      </div>

      {/* Hero Card */}
      <div style={styles.heroCard}>
        <div style={styles.avatarCircle}>{getInitials(patient.fullName)}</div>
        <div style={styles.heroInfo}>
          <h3 style={styles.heroName}>{patient.fullName}</h3>
          <div style={styles.heroMeta}>
            <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
              {patient.status || 'Admitted'}
            </span>
            <span style={styles.wardBadge}>🏥 {patient.assignedWard || 'N/A'}</span>
            <span style={styles.recTag}>MR# {patient.medicalRecordNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Assigned Ward',   value: patient.assignedWard || 'N/A', icon: '🏥', color: '#0ea5e9' },
          { label: 'Status',          value: patient.status || 'Admitted',  icon: '💊', color: statusStyle.color },
          { label: 'Admission Date',  value: patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A', icon: '📅', color: '#10b981' },
          { label: 'Discharge Date',  value: patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : 'Still Admitted', icon: '🗓️', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, borderTopColor: s.color }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            <p style={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div style={styles.infoGrid}>

        <div style={styles.infoCard}>
          <h4 style={styles.cardTitle}>👤 Identification & Contact</h4>
          <hr style={styles.divider} />
          <InfoRow label="Full Name"        value={patient.fullName} />
          <InfoRow label="NIC"              value={patient.nic || 'N/A'} />
          <InfoRow label="Contact Phone"    value={patient.contact || 'N/A'} />
          <InfoRow label="Address"          value={patient.address || 'N/A'} />
        </div>

        <div style={styles.infoCard}>
          <h4 style={styles.cardTitle}>📋 Clinical Notes</h4>
          <hr style={styles.divider} />
          <p style={styles.notesLabel}>General Notes on Admission</p>
          <div style={styles.notesBox}>
            {patient.notes || 'No notes available.'}
          </div>
          <button onClick={loadDailyUpdates} style={styles.updatesBtn}>
            {updatesLoaded ? '▲ Hide Daily Updates' : '▼ View Daily Updates'}
          </button>
        </div>

      </div>

      {/* Daily Updates Section */}
      {updatesLoaded && (
        <div style={styles.updatesCard}>
          <h4 style={styles.cardTitle}>📝 Daily Updates History</h4>
          <hr style={styles.divider} />
          {updates.length > 0 ? (
            <div style={styles.updatesList}>
              {updates.map((update, i) => (
                <div key={i} style={styles.updateRow}>
                  <div style={styles.updateLeft}>
                    <span style={styles.updateDate}>{formatDateTime(update.updateDate)}</span>
                    <p style={styles.updateSummary}>{update.summary}</p>
                  </div>
                  {update.recordedByName && (
                    <span style={styles.recordedBadge}>By: {update.recordedByName}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No historical updates to display.</p>
          )}
        </div>
      )}

    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 40px',
    background: '#f1f5f9',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
  },
  center: {
    padding: 40, textAlign: 'center', color: '#64748b',
    fontFamily: 'Segoe UI, sans-serif',
  },

  // Header
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28,
  },
  pageTitle: { fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 },
  pageSubtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  backBtn: {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '8px 18px', textDecoration: 'none',
    color: '#475569', fontSize: 14, fontWeight: 500,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },

  // Hero
  heroCard: {
    background: 'white', borderRadius: 14,
    padding: '24px 28px', display: 'flex',
    alignItems: 'center', gap: 20, marginBottom: 20,
    boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: '50%',
    background: '#0ea5e9', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, flexShrink: 0,
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' },
  heroMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  statusBadge: {
    border: '1px solid', borderRadius: 100,
    padding: '4px 12px', fontSize: 13, fontWeight: 500,
  },
  wardBadge: {
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', borderRadius: 100,
    padding: '4px 12px', fontSize: 13, fontWeight: 500,
  },
  recTag: {
    background: '#f8fafc', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: 100,
    padding: '4px 12px', fontSize: 13,
  },

  // Stats
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 20,
  },
  statCard: {
    background: 'white', borderRadius: 12,
    padding: '18px 16px', textAlign: 'center',
    borderTop: '3px solid', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
  statValue: { fontSize: 18, fontWeight: 700, margin: '8px 0 4px' },
  statLabel: { color: '#64748b', fontSize: 12, margin: 0 },

  // Info cards
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  infoCard: {
    background: 'white', borderRadius: 14,
    padding: '22px 26px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 12px' },
  divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 16px' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #f8fafc',
  },
  infoLabel: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  infoValue: { color: '#1e293b', fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: '60%' },

  // Notes
  notesLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  notesBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '12px 16px',
    color: '#334155', fontSize: 14, lineHeight: 1.6,
    marginBottom: 16,
  },
  updatesBtn: {
    background: 'white', border: '1px solid #bfdbfe',
    color: '#1d4ed8', borderRadius: 8, padding: '8px 18px',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    width: '100%',
  },

  // Updates section
  updatesCard: {
    background: 'white', borderRadius: 14,
    padding: '22px 26px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  },
  updatesList: { display: 'flex', flexDirection: 'column', gap: 12 },
  updateRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '12px 16px',
    background: '#f8fafc', borderRadius: 10,
    border: '1px solid #f1f5f9',
  },
  updateLeft: { flex: 1 },
  updateDate: { color: '#94a3b8', fontSize: 12 },
  updateSummary: { color: '#1e293b', fontSize: 14, margin: '4px 0 0', fontWeight: 500 },
  recordedBadge: {
    background: '#eff6ff', color: '#1d4ed8',
    border: '1px solid #bfdbfe', borderRadius: 100,
    padding: '4px 12px', fontSize: 12, fontWeight: 500,
    flexShrink: 0, marginLeft: 12,
  },
};