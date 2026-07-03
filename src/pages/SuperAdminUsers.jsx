import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getAdminUserList, executeRoleAction, executeUserDeletion } from '../api/userApi';

const SuperAdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getAdminUserList();
        setUsers(response.data || []);
      } catch (err) {
        setError('Failed to pull system user records.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleAction = async (targetId, actionType, name) => {
    if (window.confirm(`Are you sure you want to trigger a ${actionType} action on ${name}?`)) {
      try {
        await executeRoleAction(targetId, actionType);
        alert(`Account configuration updated.`);
        // Refresh structural records
        const freshData = await getAdminUserList();
        setUsers(freshData.data || []);
      } catch (err) {
        alert(err.response?.data?.message || 'Action processing failure.');
      }
    }
  };

  const handleDelete = async (targetId, name) => {
    if (window.confirm(`⚠️ CRITICAL WARNING: Permanently wipe ${name}'s account? This step cannot be rolled back.`)) {
      try {
        await executeUserDeletion(targetId);
        setUsers(users.filter(u => u.id !== targetId));
        alert('Account dropped cleanly.');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove target user.');
      }
    }
  };

  const dynamicFilteredCollection = users.filter(u => {
    if (filterRole === 'ALL') return true;
    if (filterRole === 'APPLICANTS') return u.organizer_application_status === 'APPLIED';
    return u.role === filterRole;
  });

  if (loading) return <div style={styles.center}>Reading Global Security Ledgers...</div>;
  
  // FIX: Merged styles properly using the spread operator
  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🔑 Identity & Access Management Panel</h1>
        <p>Review system accounts, handle creator privileges, and drop records.</p>
      </div>

      <div style={styles.filterBar}>
        <button onClick={() => setFilterRole('ALL')} style={{...styles.filterTab, backgroundColor: filterRole === 'ALL' ? '#333' : '#eee', color: filterRole === 'ALL' ? '#fff' : '#333'}}>All Users ({users.length})</button>
        <button onClick={() => setFilterRole('APPLICANTS')} style={{...styles.filterTab, backgroundColor: filterRole === 'APPLICANTS' ? '#ffc107' : '#eee', color: '#333', fontWeight: 'bold'}}>Applications ({users.filter(u => u.organizer_application_status === 'APPLIED').length})</button>
        <button onClick={() => setFilterRole('ORGANIZER')} style={{...styles.filterTab, backgroundColor: filterRole === 'ORGANIZER' ? '#17a2b8' : '#eee', color: filterRole === 'ORGANIZER' ? '#fff' : '#333'}}>Organizers</button>
        <button onClick={() => setFilterRole('USER')} style={{...styles.filterTab, backgroundColor: filterRole === 'USER' ? '#28a745' : '#eee', color: filterRole === 'USER' ? '#fff' : '#333'}}>Attendees</button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Identity Details</th>
              <th style={styles.th}>Assigned Context Role</th>
              <th style={styles.th}>Application Tracker</th>
              <th style={styles.th}>Security Controls</th>
            </tr>
          </thead>
          <tbody>
            {dynamicFilteredCollection.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{u.name}</strong><br />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{u.email}</span>
                </td>
                <td style={styles.td}>
                  <span style={{...styles.badge, backgroundColor: u.role === 'SUPER_ADMIN' ? '#dc3545' : u.role === 'ADMIN' ? '#fd7e14' : u.role === 'ORGANIZER' ? '#17a2b8' : '#6c757d', color: '#fff'}}>
                    {u.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {u.organizer_application_status === 'APPLIED' ? (
                    <span style={{...styles.badge, backgroundColor: '#ffc107', color: '#000'}}>PENDING REVIEW ⏳</span>
                  ) : u.organizer_application_status === 'REJECTED' ? (
                    <span style={{...styles.badge, backgroundColor: '#e2e3e5', color: '#383d41'}}>REJECTED ❌</span>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>None</span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {u.organizer_application_status === 'APPLIED' && (
                      <>
                        <button onClick={() => handleAction(u.id, 'APPROVE', u.name)} style={styles.actionGreen}>Approve Request</button>
                        <button onClick={() => handleAction(u.id, 'REJECT', u.name)} style={styles.actionGrey}>Reject</button>
                      </>
                    )}
                    {u.role === 'ORGANIZER' && (
                      <button onClick={() => handleAction(u.id, 'DEMOTE', u.name)} style={styles.actionOrange}>Demote to Attendee</button>
                    )}
                    {u.role === 'USER' && u.organizer_application_status !== 'APPLIED' && (
                      <button onClick={() => handleAction(u.id, 'APPROVE', u.name)} style={styles.actionBlue}>Promote to Organizer</button>
                    )}
                    {u.role !== 'SUPER_ADMIN' && (
                      <button onClick={() => handleDelete(u.id, u.name)} style={styles.actionRed}>Delete User</button>
                    )}
                  </div>
                </td>
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
  container: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' },
  header: { marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' },
  filterBar: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterTab: { padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8f9fa', padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '1rem', verticalAlign: 'middle' },
  badge: { padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  actionGreen: { padding: '0.4rem 0.8rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  actionBlue: { padding: '0.4rem 0.8rem', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  actionOrange: { padding: '0.4rem 0.8rem', backgroundColor: '#fd7e14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  actionGrey: { padding: '0.4rem 0.8rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  actionRed: { padding: '0.4rem 0.8rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }
};

export default SuperAdminUsers;