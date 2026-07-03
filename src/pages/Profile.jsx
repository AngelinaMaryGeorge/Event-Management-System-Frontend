import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/userApi';
import { submitOrganizerApplication } from '../api/userApi';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext); // Bring in setUser to update navbar name if changed
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    created_at: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        // Based on your controller: sendSuccess(res, { profile: user }, 200)
        const profileData = response.data.profile; 
        
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          role: profileData.role || 'USER',
          created_at: new Date(profileData.created_at).toLocaleDateString() || ''
        });
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      // Only send the fields that are allowed to be updated
      const updatePayload = { name: formData.name };
      
      const response = await updateUserProfile(updatePayload);
      
      setSuccessMsg('Profile updated successfully!');
      
      // Update the global context so the Navbar instantly shows the new name
      if (user && setUser) {
        setUser({ ...user, name: formData.name });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading your profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Account Settings</h1>
        <p>Manage your personal information and preferences.</p>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.error}>{error}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address (Cannot be changed)</label>
            <input 
              type="email" 
              value={formData.email} 
              disabled 
              style={styles.disabledInput}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Role</label>
              <div style={styles.badge}>
                {formData.role}
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Member Since</label>
              <input 
                type="text" 
                value={formData.created_at} 
                disabled 
                style={styles.disabledInput}
              />
            </div>
          </div>

          <button type="submit" disabled={isSaving} style={styles.button}>
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>

        {user?.role === 'USER' && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e2f0d9', borderRadius: '8px', border: '1px solid #ccd1c7' }}>
            <h3>Want to host your own events?</h3>
            <p>Upgrade your account profile status to become a platform event organizer and gain access to creator capabilities.</p>
            <button
              onClick={async () => {
                try {
                  await submitOrganizerApplication();
                  alert('Your promotion application has been sent to the system administration queue!');
                } catch (e) {
                  alert(e.response?.data?.message || 'Application submission error.');
                }
              }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Apply to become an Organizer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Styling
const styles = {
  center: { padding: '4rem', textAlign: 'center', fontSize: '1.2rem', color: '#555' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' },
  header: { marginBottom: '2rem', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  row: { display: 'flex', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  label: { fontWeight: 'bold', color: '#333', fontSize: '0.9rem' },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' },
  disabledInput: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #e0e0e0', backgroundColor: '#f8f9fa', color: '#6c757d', fontSize: '1rem', cursor: 'not-allowed' },
  badge: { display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#e6f4ea', color: '#1e8e3e', borderRadius: '4px', fontWeight: 'bold', width: 'fit-content', border: '1px solid #c3e6cb' },
  button: { padding: '1rem', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' },
  error: { backgroundColor: '#ffe6e6', color: '#d9534f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  success: { backgroundColor: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }
};

export default Profile;