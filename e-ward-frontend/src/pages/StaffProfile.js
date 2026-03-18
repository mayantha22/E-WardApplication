import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import staffService from '../services/staffService';
import { toast } from 'react-toastify';

export default function StaffProfile() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStaffProfile(); }, [id]);

  async function loadStaffProfile() {
    try {
      const response = await staffService.getById(id);
      setStaff(response);
    } catch (err) {
      toast.error("Failed to load staff profile.");
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  if (loading) return <div style={styles.center}>Loading Staff Profile...</div>;
  if (!staff)  return <div style={styles.center}>Staff member not found.</div>;

  const fullName = staff.fullName || 'Unknown';

  return (
    <div style={styles.page}>

      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Staff Profile</h2>
          <p style={styles.pageSubtitle}>View staff member details and assignments</p>
        </div>
        <Link to="/staff" style={styles.backBtn}>← Back to Staff List</Link>
      </div>

      {/* Hero Card */}
      <div style={styles.heroCard}>
        <div style={styles.avatarCircle}>{getInitials(fullName)}</div>
        <div style={styles.heroInfo}>
          <h3 style={styles.heroName}>{fullName}</h3>
          <div style={styles.heroMeta}>
            <span style={styles.desigBadge}>{staff.designation || 'N/A'}</span>
            <span style={styles.wardBadge}>🏥 {staff.ward || 'N/A'}</span>
            <span style={styles.empTag}>#{staff.employeeNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Stats Row - only 2 cards */}
      <div style={styles.statsRow}>
        {[
          { label: 'Assigned Ward', value: staff.ward || 'N/A', icon: '🏥', color: '#0ea5e9' },
          { label: 'System Role',   value: staff.role || 'STAFF', icon: '🔖', color: '#10b981' },
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
          <h4 style={styles.cardTitle}>📞 Contact Information</h4>
          <hr style={styles.divider} />
          <InfoRow label="Email"   value={staff.email} />
          <InfoRow label="Phone"   value={staff.phone || 'N/A'} />
          <InfoRow label="Address" value={staff.address || 'N/A'} />
        </div>

        <div style={styles.infoCard}>
          <h4 style={styles.cardTitle}>🩺 Employment Details</h4>
          <hr style={styles.divider} />
          <InfoRow label="Designation"     value={staff.designation || 'N/A'} />
          <InfoRow label="Assigned Ward"   value={staff.ward || 'N/A'} />
          <InfoRow label="Employee Number" value={staff.employeeNumber || 'N/A'} />
        </div>

      </div>
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
    background: '#1d4ed8', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, flexShrink: 0,
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' },
  heroMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  desigBadge: {
    background: '#eff6ff', color: '#1d4ed8',
    border: '1px solid #bfdbfe', borderRadius: 100,
    padding: '4px 12px', fontSize: 13, fontWeight: 500,
  },
  wardBadge: {
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', borderRadius: 100,
    padding: '4px 12px', fontSize: 13, fontWeight: 500,
  },
  empTag: {
    background: '#f8fafc', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: 100,
    padding: '4px 12px', fontSize: 13,
  },

  // Stats
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16, marginBottom: 20,
  },
  statCard: {
    background: 'white', borderRadius: 12,
    padding: '18px 16px', textAlign: 'center',
    borderTop: '3px solid', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
  statValue: { fontSize: 22, fontWeight: 700, margin: '8px 0 4px' },
  statLabel: { color: '#64748b', fontSize: 12, margin: 0 },

  // Info cards
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
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
};