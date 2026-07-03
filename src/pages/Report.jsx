import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getSystemReports } from '../api/reportApi';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Security Check: Kick out anyone who isn't Admin/Super Admin
  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getSystemReports();
        setData(response.data); // Based on your sendSuccess standardizer
      } catch (err) {
        setError('Failed to load system reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={styles.center}>Generating Analytics...</div>;
  if (error) return <div style={styles.center}>{error}</div>;
  if (!data) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Platform Analytics</h1>
        <p>System overview and event performance metrics.</p>
      </div>

      {/* Top Level Metric Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <h3>Total Users</h3>
          <p style={styles.metricNumber}>{data.overview.users}</p>
        </div>
        <div style={styles.metricCard}>
          <h3>Total Organizers</h3>
          <p style={styles.metricNumber}>{data.overview.organizers}</p>
        </div>
        <div style={styles.metricCard}>
          <h3>Total Events</h3>
          <p style={styles.metricNumber}>{data.overview.events}</p>
        </div>
        <div style={styles.metricCard}>
          <h3>Tickets Processed</h3>
          <p style={styles.metricNumber}>{data.overview.totalTickets}</p>
        </div>
      </div>

      {/* Event Performance Table */}
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Event Performance</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Event Title</th>
              <th style={styles.th}>Capacity</th>
              <th style={styles.th}>Registered</th>
              <th style={styles.th}>Fill Rate</th>
              <th style={styles.th}>Actually Attended</th>
            </tr>
          </thead>
          <tbody>
            {data.eventPerformance.map((event) => (
              <tr key={event.id} style={styles.tr}>
                <td style={styles.td}><strong>{event.title}</strong></td>
                <td style={styles.td}>{event.capacity}</td>
                <td style={styles.td}>{event.registered}</td>
                <td style={styles.td}>
                  {/* Progress Bar UI */}
                  <div style={styles.progressContainer}>
                    <div style={{ ...styles.progressBar, width: `${Math.min(event.fillRate, 100)}%`, backgroundColor: event.fillRate >= 100 ? '#dc3545' : '#28a745' }}></div>
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{event.fillRate}%</span>
                </td>
                <td style={styles.td}>{event.attended}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  center: { padding: '4rem', textAlign: 'center', fontSize: '1.2rem' },
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  header: { marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  metricCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e0e0e0' },
  metricNumber: { fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#007BFF' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8f9fa', padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '1rem', color: '#333' },
  progressContainer: { width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', height: '8px', marginBottom: '0.25rem' },
  progressBar: { height: '100%', borderRadius: '4px' }
};

export default Reports;