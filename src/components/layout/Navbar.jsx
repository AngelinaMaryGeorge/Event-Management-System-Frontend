import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  // Grab the user state and logout function from our global context
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears the token and user state
    navigate('/login'); // Sends them back to the login page
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        {/* Clicking the logo always takes you to the public events page */}
        <Link to="/" style={styles.logoText}>EventConnect</Link>
      </div>

      <div style={styles.links}>
        <Link to="/events" style={styles.link}>Explore Events</Link>

        {/* Conditional Rendering: What to show if logged in vs logged out */}
        {user ? (
          <>
            {/* Secret Super Admin Link */}
            {user.role === 'SUPER_ADMIN' && (
            <>
            <Link to="/admin" style={{ ...styles.link, color: '#dc3545', fontWeight: 'bold' }}>
             Event Queue
            </Link>
            <Link to="/admin/users" style={{ ...styles.link, color: '#fd7e14', fontWeight: 'bold' }}>
             User Management
            </Link>
            </>
           )}
            
            {/* Analytics Link for Admins and Super Admins */}
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <Link to="/reports" style={{ ...styles.link, color: '#17a2b8', fontWeight: 'bold' }}>
                Reports
              </Link>
            )}
            
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/profile" style={styles.link}>Profile</Link>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.signupButton}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Clean, inline styles for the MVP
const styles = {
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '1rem 2rem', 
    backgroundColor: '#1a1a1a', 
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold' 
  },
  logoText: { 
    color: '#ffffff', 
    textDecoration: 'none' 
  },
  links: { 
    display: 'flex', 
    gap: '1.5rem', 
    alignItems: 'center' 
  },
  link: { 
    color: '#ffffff', 
    textDecoration: 'none', 
    fontSize: '1rem',
    cursor: 'pointer'
  },
  logoutButton: { 
    backgroundColor: '#dc3545', 
    color: '#ffffff', 
    border: 'none', 
    padding: '0.5rem 1rem', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  signupButton: { 
    backgroundColor: '#28a745', 
    color: '#ffffff', 
    border: 'none', 
    padding: '0.5rem 1rem', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Navbar;