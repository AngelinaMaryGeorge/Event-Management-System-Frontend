import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventParticipants } from '../api/eventApi';
import { markAttendance, removeParticipantAdmin } from '../api/registrationApi';
import { AuthContext } from '../contexts/AuthContext'; // 1. Bring in context

const EventParticipants = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // 2. Get the user
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 3. Define the clever role checks
  const isOrganizer = user?.role === 'ORGANIZER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await getEventParticipants(id);
        setParticipants(response.data);
      } catch (err) {
        setError('Failed to load participants. You might not have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [id]);

  const handleRemove = async (registrationId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this event?`)) {
      try {
        await removeParticipantAdmin(registrationId);
        // Instantly remove them from the UI list
        setParticipants(participants.filter(p => p.id !== registrationId));
        alert('Participant removed successfully.');
      } catch (err) {
        alert('Failed to remove participant.');
      }
    }
  };

  if (loading) return <div style={styles.center}>Loading guest list...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Guest List & Participants</h2>
        <Link to={`/events/${id}`} style={styles.backButton}>&larr; Back to Event</Link>
      </div>

      <div style={styles.card}>
        {participants.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No one has registered for this event yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Registration Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th> {/* New Column for Actions */}
              </tr>
            </thead>
            <tbody>
              {participants.map((reg) => (
                <tr key={reg.id} style={styles.tr}>
                  <td style={styles.td}><strong>{reg.users.name}</strong></td>
                  <td style={styles.td}>{reg.users.email}</td>
                  <td style={styles.td}>{new Date(reg.registered_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {reg.status === 'Attended' ? (
                      <span style={{...styles.badge, backgroundColor: '#cce5ff', color: '#004085'}}>Attended ✅</span>
                    ) : (
                      <span style={styles.badge}>{reg.status || 'Registered'}</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* ORGANIZER ONLY: Mark Attendance */}
                      {isOrganizer && reg.status !== 'Attended' && (
                        <button 
                          onClick={async () => {
                            try {
                              await markAttendance(reg.id);
                              setParticipants(participants.map(p => p.id === reg.id ? {...p, status: 'Attended'} : p));
                            } catch (e) {
                              alert('Failed to mark attendance');
                            }
                          }}
                          style={styles.attendBtn}
                        >
                          Mark Present
                        </button>
                      )}

                      {/* ADMIN ONLY: Remove Participant */}
                      {isAdmin && (
                        <button 
                          onClick={() => handleRemove(reg.id, reg.users.name)}
                          style={styles.removeBtn}
                        >
                          Remove
                        </button>
                      )}
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

const styles = {
  center: { padding: '4rem', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  backButton: { textDecoration: 'none', color: '#007BFF', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8f9fa', padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '1rem', color: '#333' },
  badge: { backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' },
  attendBtn: { padding: '0.25rem 0.5rem', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
  removeBtn: { padding: '0.25rem 0.5rem', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default EventParticipants;