import React, { useState, useContext } from 'react'; // ADD useContext
import { useNavigate, Navigate } from 'react-router-dom'; // ADD Navigate
import { createEvent } from '../api/eventApi';
import { AuthContext } from '../contexts/AuthContext'; // ADD AuthContext

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get the logged-in user

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Security check: Kick out standard users immediately
  const hasOrganizerRights = user && ['ORGANIZER'].includes(user.role);
  if (!hasOrganizerRights) {
    return <Navigate to="/dashboard" replace />;
  }

  // State for all text inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    registration_deadline: ''
  });

  // Separate state for the file upload
  const [bannerFile, setBannerFile] = useState(null);

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
      // 1. Create a FormData object (required for sending files)
      const submitData = new FormData();
      
      // 2. Append all text fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // 3. Append the file (the key 'banner' must match your Multer backend)
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }

      // 4. Send to backend
      await createEvent(submitData);
      
      alert('Event created successfully!');
      navigate('/events'); // Redirect to public events page to see it
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please check your inputs.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create a New Event</h2>
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
          <label>Event Banner Image (Optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Uploading & Creating...' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
};

// Styling
const styles = {
  container: { maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' },
  row: { display: 'flex', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' },
  fileInput: { padding: '0.5rem', fontSize: '1rem' },
  button: { padding: '1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
  error: { backgroundColor: '#ffe6e6', color: '#d9534f', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }
};

export default CreateEvent;