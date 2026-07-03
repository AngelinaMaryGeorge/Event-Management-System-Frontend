import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getApprovalQueue, updateEventStatus } from '../api/eventApi';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Security Check: Bouncer at the door for non-Super Admins
  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. Fetch the pending events
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await getApprovalQueue();
        // Standardizer wraps the array in 'data'
        setQueue(response.data || []); 
      } catch (err) {
        setError('Failed to load the approval queue.');
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  // 3. Handle the Approve/Reject Action
  const handleStatusUpdate = async (eventId, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this event?`)) {
      try {
        await updateEventStatus(eventId, newStatus);
        alert(`Event has been ${newStatus}!`);
        // Remove the processed event from the screen immediately
        setQueue(queue.filter(event => event.id !== eventId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update status.');
      }
    }
  };

  if (loading) return <div style={styles.center}>Loading queue...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛡️ Super Admin Control Panel</h1>
        <p>Review and approve pending event requests.</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Pending Approvals</h2>
        
        {queue.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            All caught up! No pending events in the queue.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event Title</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Organizer ID</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((event) => (
                <tr key={event.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{event.title}</strong><br/>
                    <Link to={`/events/${event.id}`} style={{ fontSize: '0.85rem', color: '#007BFF' }}>Preview Event</Link>
                  </td>
                  <td style={styles.td}>{new Date(event.start_date).toLocaleDateString()}</td>
                  <td style={styles.td}>{event.created_by}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleStatusUpdate(event.id, 'APPROVED')}
                        style={styles.approveBtn}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(event.id, 'REJECTED')}
                        style={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Clean Dashboard Styling
const styles = {
  center: { padding: '4rem', textAlign: 'center', fontSize: '1.2rem' },
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  header: { marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' },
  error: { backgroundColor: '#ffe6e6', color: '#d9534f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8f9fa', padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '1rem', color: '#333' },
  approveBtn: { padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  rejectBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminDashboard;