import React, { useEffect, useState } from 'react';

function MusicPage() {
  const [allMusic, setAllMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12; // Display more music items per page

  useEffect(() => {
    const fetchAllMusic = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/all-music');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllMusic(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (e) {
        setError('Failed to fetch music: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMusic();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentMusic = allMusic.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div style={{ paddingTop: '62px', textAlign: 'center' }}>
        <h2>All Music</h2>
        <div className="recommendations-grid">
          {Array(itemsPerPage).fill().map((_, idx) => (
            <div key={`music-skeleton-${idx}`} className="recommendation-card">
              <div className="skeleton skeleton-thumbnail"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-meta"></div>
              <div className="skeleton skeleton-meta"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ paddingTop: '62px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ paddingTop: '62px', textAlign: 'center' }}>
      <h2>All Music</h2>
      <div className="recommendations-grid">
        {currentMusic.map((item, idx) => (
          <div key={idx} className="recommendation-card" style={{boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)', borderRadius: 16, overflow: 'hidden', background: '#fff', margin: 12, transition: 'transform 0.2s', transform: 'scale(1)', border: '1px solid #e3e3e3', maxWidth: 320}}>
<<<<<<< HEAD
            <img className="recommendation-thumbnail" src={item.img || 'https://via.placeholder.com/320x180?text=Thumbnail'} alt="thumbnail" style={{width: '100%', height: 200, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16}} />
=======
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653
            <div className="recommendation-content" style={{padding: 16}}>
              <div className="recommendation-title" style={{fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#1976d2'}}>{item.title}</div>
              <div className="recommendation-meta" style={{fontSize: 15, marginBottom: 8, color: '#555'}}>
                <span><b>Artist:</b> {item.artist}</span><br/>
                <span><b>Genre:</b> {item.top_genre}</span><br/>
                <span><b>Year:</b> {item.year}</span>
              </div>
              {/* You can add more details here if needed, e.g., bpm, duration, etc. */}
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default MusicPage;