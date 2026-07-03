import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, deleteEvent } from '../api/eventApi';
import { registerForEvent } from '../api/registrationApi';
import { AuthContext } from '../contexts/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (err) {
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      alert('You must be logged in to register for an event!');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await registerForEvent(id);
      alert('Success! You are registered for this event.');
      navigate('/dashboard');
    } catch (err) {
      const backendMessage = err.response?.data?.message || 'Failed to register.';
      alert(`Registration failed: ${backendMessage}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(id);
        alert('Event deleted successfully.');
        navigate('/events'); 
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete event.');
      }
    }
  };

  if (loading) return <div style={styles.center}>Loading event details...</div>;
  if (error) return <div style={styles.center}>{error}</div>;
  if (!event) return null;

  // ROLE CHECKS
  const isOrganizer = user?.role === 'ORGANIZER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const showControlPanel = isOrganizer || isAdmin;

  // CAPACITY AND TIME LOGIC
  const spotsLeft = Math.max(0, event.max_participants - (event.current_participants || 0));
  const isSoldOut = spotsLeft === 0;
  const isPastEvent = new Date(event.start_date) < new Date();
  
  let buttonText = 'Register for Event';
  if (isPastEvent) buttonText = 'Event Ended';
  else if (isSoldOut) buttonText = 'Sold Out';
  else if (registering) buttonText = 'Processing...';

  // Determine if the button should be disabled
  const isButtonDisabled = registering || isSoldOut || isPastEvent;

  return (
    <div style={styles.container}>
      
      {/* DYNAMIC MANAGEMENT CONTROLS */}
      {showControlPanel && (
        <div style={{...styles.adminPanel, backgroundColor: isAdmin ? '#f8d7da' : '#fff3cd', borderColor: isAdmin ? '#f5c6cb' : '#ffeeba'}}>
          <p style={{ margin: 0, fontWeight: 'bold', color: isAdmin ? '#721c24' : '#856404' }}>
            {isAdmin ? '🛡️ Admin Event Controls' : '⚙️ Organizer Controls'}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {(isOrganizer || isAdmin) && (
               <Link to={`/events/${event.id}/participants`} style={styles.viewButton}>View Participants</Link>
            )}
            <Link to={`/edit-event/${event.id}`} style={styles.editButton}>Edit Event</Link>
            {isAdmin && (
              <button onClick={handleDelete} style={styles.deleteButton}>Delete Event</button>
            )}
          </div>
        </div>
      )}

      {event.banner_url ? (
        <img src={event.banner_url} alt={event.title} style={styles.banner} />
      ) : (
        <div style={styles.placeholderBanner}>No Event Banner</div>
      )}

      <div style={styles.content}>
        <h1 style={styles.title}>{event.title}</h1>
        
        <div style={styles.infoCard}>
          <p><strong>📅 Date:</strong> {new Date(event.start_date).toLocaleString()}</p>
          <p><strong>📍 Venue:</strong> {event.venue}</p>
          <p><strong>🎟️ Capacity:</strong> {event.max_participants} people</p>
          
          {/* DYNAMIC SPOTS LEFT INDICATOR */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: isSoldOut ? '#f8d7da' : '#e6f4ea', borderRadius: '4px', display: 'inline-block', border: `1px solid ${isSoldOut ? '#f5c6cb' : '#c3e6cb'}` }}>
            <strong style={{ color: isSoldOut ? '#721c24' : '#155724' }}>
              {isSoldOut ? 'Sold Out!' : `🔥 Only ${spotsLeft} spots left!`}
            </strong>
          </div>
        </div>

        <div style={styles.descriptionBox}>
          <h3>About this Event</h3>
          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{event.description || 'No description provided.'}</p>
        </div>

        {/* CONDITIONALLY RENDERED REGISTER BUTTON */}
        {user?.role === 'USER' && (
          <button 
            onClick={handleRegister} 
            disabled={isButtonDisabled}
            style={{ 
              ...styles.registerButton, 
              backgroundColor: isButtonDisabled ? '#6c757d' : '#28a745',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              opacity: isButtonDisabled ? 0.8 : 1
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  center: { padding: '4rem', textAlign: 'center', fontSize: '1.2rem' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  adminPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid' },
  editButton: { padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#000', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  deleteButton: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  banner: { width: '100%', height: '350px', objectFit: 'cover', borderRadius: '8px' },
  placeholderBanner: { width: '100%', height: '350px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '1.5rem' },
  content: { marginTop: '2rem' },
  title: { fontSize: '2.5rem', marginBottom: '1.5rem', color: '#333' },
  infoCard: { backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #dee2e6' },
  descriptionBox: { marginBottom: '2.5rem' },
  registerButton: { width: '100%', padding: '1rem', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold' },
  viewButton: { padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default EventDetails;