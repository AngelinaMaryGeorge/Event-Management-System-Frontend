import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../api/eventApi';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('All');
  const [sortOrder, setSortOrder] = useState('dateAsc'); 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents();
        setEvents(response.data || []); 
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Dynamically extract unique venues from the events array for the dropdown
  const uniqueVenues = useMemo(() => {
    const venues = events.map(e => e.venue).filter(Boolean); // filter out null/undefined
    return ['All', ...new Set(venues)]; // Set removes duplicates
  }, [events]);

  // Apply filters and sorting efficiently without mutating original state
  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // 1. Text Search Filter (Case-insensitive)
    if (searchTerm) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Venue Dropdown Filter
    if (selectedVenue !== 'All') {
      result = result.filter(event => event.venue === selectedVenue);
    }

    // 3. Date Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortOrder === 'dateAsc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [events, searchTerm, selectedVenue, sortOrder]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading amazing events...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '1rem' }}>Explore Upcoming Events</h1>
      
      {/* Search & Filter Toolbar */}
      <div style={styles.toolbar}>
        <input 
          type="text" 
          placeholder="🔍 Search by event title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.filters}>
          <select 
            value={selectedVenue} 
            onChange={(e) => setSelectedVenue(e.target.value)}
            style={styles.selectInput}
          >
            {uniqueVenues.map(venue => (
              <option key={venue} value={venue}>
                {venue === 'All' ? 'All Venues' : venue}
              </option>
            ))}
          </select>

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            style={styles.selectInput}
          >
            <option value="dateAsc">Date: Soonest First</option>
            <option value="dateDesc">Date: Furthest First</option>
          </select>
        </div>
      </div>

      {filteredAndSortedEvents.length === 0 ? (
        <div style={styles.noResults}>
          <h3>No events found matching your criteria.</h3>
          <button onClick={() => { setSearchTerm(''); setSelectedVenue('All'); }} style={styles.resetButton}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredAndSortedEvents.map((event) => (
            <div key={event.id} style={styles.card}>
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} style={styles.image} />
              ) : (
                <div style={styles.placeholderImage}>No Image Available</div>
              )}
              
              <div style={styles.cardContent}>
                <h3 style={styles.title}>{event.title}</h3>
                
                <p style={styles.detail}><strong>📍 Venue:</strong> {event.venue}</p>
                <p style={styles.detail}>
                  <strong>📅 Date:</strong> {new Date(event.start_date).toLocaleDateString()}
                </p>
                <p style={styles.detail}><strong>🎟️ Spots:</strong> {event.max_participants}</p>
                
                <Link to={`/events/${event.id}`} style={styles.button}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styling (Updated with Toolbar)
const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  toolbar: { display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e9ecef' },
  searchInput: { flex: '1 1 300px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
  filters: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  selectInput: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff' },
  noResults: { textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#6c757d' },
  resetButton: { marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' },
  card: { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  placeholderImage: { width: '100%', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' },
  cardContent: { padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  title: { margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#333' },
  detail: { margin: '0 0 0.5rem 0', color: '#555', fontSize: '0.95rem' },
  button: { marginTop: 'auto', padding: '0.75rem', backgroundColor: '#007BFF', color: '#fff', textAlign: 'center', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default Events;