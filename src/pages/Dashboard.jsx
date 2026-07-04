import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getMyEvents, cancelRegistration } from '../api/registrationApi';
import QRCode from "react-qr-code"; // 1. Import the QR code generator

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await getMyEvents();
        setMyRegistrations(response.data); 
      } catch (err) {
        setError('Failed to load your events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  if (loading) return <div style={styles.center}>Loading your dashboard...</div>;
  if (error) return <div style={styles.center}>{error}</div>;
  
  const handleCancel = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      try {
        await cancelRegistration(eventId);
        alert('Ticket cancelled.');
        setMyRegistrations(myRegistrations.filter(reg => reg.events.id !== eventId));
      } catch (err) {
        alert('Failed to cancel ticket.');
      }
    }
  };

  const hasOrganizerRights = user && ['ORGANIZER'].includes(user.role);

  return (
    <div style={styles.container}>
      
      <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Welcome, {user?.name}! 👋</h1>
          <p style={{ margin: 0 }}>Manage your event tickets below.</p>
        </div>
        
        {hasOrganizerRights && (
          <Link to="/create-event" style={styles.createButton}>
            + Create New Event
          </Link>
        )}
      </div>

      <h2>My Digital Tickets</h2>
      
      {myRegistrations.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" style={styles.browseButton}>Browse Events</Link>
        </div>
      ) : (
        <div style={styles.ticketList}>
          {myRegistrations.map((reg) => {
            // Create a secure payload for the QR Code
            const qrPayload = JSON.stringify({
              ticket_id: reg.id,
              event_id: reg.events.id,
              email: user.email
            });

            return (
              <div key={reg.id} style={styles.ticketCard}>
                
                {/* 2. The QR Code Section */}
                <div style={styles.qrSection}>
                  <div style={{ background: 'white', padding: '8px', borderRadius: '8px' }}>
                    <QRCode 
                      value={qrPayload} 
                      size={90} 
                      level="M" 
                    />
                  </div>
                  <span style={styles.ticketIdText}>ID: {reg.id.split('-')[0]}</span>
                </div>

                {/* Event Info */}
                <div style={styles.ticketInfo}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#333' }}>{reg.events.title}</h3>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#555' }}>
                    <strong>📍 Venue:</strong> {reg.events.venue}
                  </p>
                  <p style={{ margin: '0', color: '#555' }}>
                    <strong>📅 Date:</strong> {new Date(reg.events.start_date).toLocaleString()}
                  </p>
                </div>
                
                {/* Actions & Status */}
                <div style={styles.ticketStatus}>
                  <span style={{
                    ...styles.statusBadge, 
                    backgroundColor: reg.status === 'Attended' ? '#cce5ff' : '#e6f4ea',
                    color: reg.status === 'Attended' ? '#004085' : '#1e8e3e'
                  }}>
                    {reg.status === 'Attended' ? 'Attended ✅' : (reg.status || 'Registered')}
                  </span>
                  
                  <Link to={`/events/${reg.events.id}`} style={styles.viewLink}>
                    View Event
                  </Link>
                  
                  {/* Hide cancel button if they already attended */}
                  {reg.status !== 'Attended' && (
                    <button 
                      onClick={() => handleCancel(reg.events.id)} 
                      style={styles.cancelButton}
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Styling updated for the new QR ticket layout
const styles = {
  center: { padding: '4rem', textAlign: 'center', fontSize: '1.2rem' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' },
  header: { marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' },
  emptyState: { backgroundColor: '#f8f9fa', padding: '3rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed #ccc' },
  browseButton: { display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  
  // Ticket Card Layout
  ticketCard: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '1.5rem', 
    border: '1px solid #e0e0e0', 
    borderRadius: '12px', 
    backgroundColor: '#fff', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    gap: '2rem',
    position: 'relative',
    overflow: 'hidden'
  },
  
  // QR Code Area
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    paddingRight: '2rem',
    borderRight: '2px dashed #e0e0e0' // Gives it a "tear-off ticket" look
  },
  ticketIdText: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },

  ticketInfo: { flexGrow: 1 },
  ticketStatus: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '120px' },
  statusBadge: { padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold' },
  viewLink: { color: '#007BFF', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  createButton: { padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default Dashboard;