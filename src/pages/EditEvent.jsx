import React, { useState, useEffect, useContext } from 'react'; // 1. Added useContext
import { useNavigate, useParams, Navigate } from 'react-router-dom'; // 2. Added Navigate
import { getEventById, updateEvent } from '../api/eventApi';
import { AuthContext } from '../contexts/AuthContext'; // 3. Added AuthContext

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // 4. Get the user state

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 5. SECURITY CHECK: Kick out non-organizers
  const isOrganizer = user && user.role === 'ORGANIZER';
  if (!isOrganizer) {
    return <Navigate to="/dashboard" replace />;
  }

  const [formData, setFormData] = useState({
    title: '', description: '', venue: '', start_date: '', end_date: '', max_participants: '', registration_deadline: ''
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');

  // 1. Fetch the existing data when the page loads
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await getEventById(id);
        const event = response.data;
        
        // Format dates correctly for the HTML <input type="datetime-local">
        const formatForInput = (dateString) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().slice(0, 16);
        };

        setFormData({
          title: event.title || '',
          description: event.description || '',
          venue: event.venue || '',
          start_date: formatForInput(event.start_date),
          end_date: formatForInput(event.end_date),
          max_participants: event.max_participants || '',
          registration_deadline: formatForInput(event.registration_deadline)
        });
        
        setCurrentBannerUrl(event.banner_url);
      } catch (err) {
        setError('Failed to load event data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [id]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBannerFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }

      await updateEvent(id, submitData);
      alert('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading event data...</div>;

  return (
    <div style={styles.container}>
      <h2>Edit Event</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Event Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleTextChange} required style={styles.input} />
        </div>

        <div style={styles.inputGroup}>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleTextChange} rows="4" style={styles.input} />
        </div>

        <div style={styles.inputGroup}>
          <label>Venue</label>
          <input type="text" name="venue" value={formData.venue} onChange={handleTextChange} required style={styles.input} />
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label>Start Date & Time</label>
            <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleTextChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>End Date & Time</label>
            <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleTextChange} required style={styles.input} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label>Max Participants</label>
            <input type="number" name="max_participants" value={formData.max_participants} onChange={handleTextChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Registration Deadline</label>
            <input type="datetime-local" name="registration_deadline" value={formData.registration_deadline} onChange={handleTextChange} required style={styles.input} />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label>Update Banner Image</label>
          {currentBannerUrl && !bannerFile && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              Current image will be kept unless you upload a new one.
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' },
  row: { display: 'flex', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' },
  fileInput: { padding: '0.5rem', fontSize: '1rem' },
  button: { padding: '1rem', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
  error: { backgroundColor: '#ffe6e6', color: '#d9534f', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }
};

export default EditEvent;