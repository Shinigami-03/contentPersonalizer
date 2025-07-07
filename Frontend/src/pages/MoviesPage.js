import React, { useEffect, useState } from 'react';
import '../App.css';

function MoviesPage({ recommendations = [] }) {
  const [allMovies, setAllMovies] = useState([]);
  const [allMoviesLoading, setAllMoviesLoading] = useState(false);
  const [currentMoviesPage, setCurrentMoviesPage] = useState(1);
  const [totalMoviesPages, setTotalMoviesPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setAllMoviesLoading(true);
    fetch("http://localhost:8000/all-movies")
      .then((res) => res.json())
      .then((data) => {
        // Filter out movies that are already in recommendations
        const recommendedTitles = new Set(recommendations.map(rec => rec.Title));
        const filteredMovies = data.filter(movie => !recommendedTitles.has(movie.Title));
        setAllMovies(filteredMovies);
        setTotalMoviesPages(Math.ceil(filteredMovies.length / itemsPerPage));
      })
      .catch((err) => console.error(err))
      .finally(() => setAllMoviesLoading(false));
  }, [recommendations]);

  const handleMoviesPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalMoviesPages) {
      setCurrentMoviesPage(newPage);
    }
  };

  const paginatedMovies = allMovies.slice(
    (currentMoviesPage - 1) * itemsPerPage,
    currentMoviesPage * itemsPerPage
  );

  return (
    <div style={{width: '100%', maxWidth: 1200, margin: '32px auto 0', paddingTop: '62px'}}> {/* Added paddingTop to account for fixed navbar */}
      <h3 style={{textAlign: 'left', margin: '32px 0 16px 8px', color: '#1976d2'}}>All Movies</h3>
      <div className="recommendations-grid">
        {allMoviesLoading ? (
          <>
            {console.log('Rendering skeleton loaders')}
            {Array(itemsPerPage).fill().map((_, idx) => (
              <div key={`skeleton-${idx}`} className="recommendation-card">
                <div className="skeleton skeleton-thumbnail"></div>
                <div className="recommendation-content">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-meta"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          paginatedMovies.map((card, idx) => (
            <div key={idx} className="recommendation-card" style={{boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)', borderRadius: 16, overflow: 'hidden', background: '#fff', margin: 12, transition: 'transform 0.2s', transform: 'scale(1)', border: '1px solid #e3e3e3', maxWidth: 320}}>
              <img className="recommendation-thumbnail" src={card.Poster_Url || card.LocalPoster || card.Poster || 'https://via.placeholder.com/320x180?text=Thumbnail'} alt="thumbnail" style={{width: '100%', height: 200, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16}} />
              <div className="recommendation-content" style={{padding: 16}}>
                <div className="recommendation-title" style={{fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#1976d2'}}>{card.Title}</div>
                <div className="recommendation-meta" style={{fontSize: 15, marginBottom: 8, color: '#555'}}>
                  {card.Genre && <span><b>Genre:</b> {card.Genre} &nbsp;</span>}
                  {card.Rating && <span style={{background: '#ffd700', color: '#222', borderRadius: 8, padding: '2px 8px', marginLeft: 8}}><b>★ {card.Rating}</b></span>}
                </div>
                {card.Overview && <div style={{fontSize: 14, color: '#666', marginBottom: 8, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis'}}>{card.Overview}</div>}
              </div>
            </div>
          ))
        )}
      </div>
      {!allMoviesLoading && allMovies.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => handleMoviesPageChange(currentMoviesPage - 1)}
            disabled={currentMoviesPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentMoviesPage} of {totalMoviesPages}
          </span>
          <button 
            onClick={() => handleMoviesPageChange(currentMoviesPage + 1)}
            disabled={currentMoviesPage === totalMoviesPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MoviesPage;