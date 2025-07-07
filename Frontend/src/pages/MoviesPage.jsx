import React from "react";
import MovieCard from "../components/MovieCard";
import styles from "./MoviesPage.module.css";

const MoviesPage = ({
  search,
  setSearch,
  handleSearch,
  loading,
  error,
  recommendations,
  handlePageChange,
  currentPage,
  totalPages,
  itemsPerPage,
  allMoviesLoading,
  paginatedMovies,
  handleMoviesPageChange,
  currentMoviesPage,
  totalMoviesPages,
  allMovies
}) => (
  <div>
    <header className={styles["movies-header"]}>
      <h2>Content Personalization Agent</h2>
      <form onSubmit={handleSearch} className={styles["search-bar"]}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for content..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {loading ? (
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <h3 style={{ textAlign: 'left', margin: '32px 0 16px 8px', color: '#1976d2' }}>Recommended for you</h3>
          <div className="recommendations-grid">
            {Array(itemsPerPage).fill().map((_, idx) => (
              <div key={`rec-skeleton-${idx}`} className="recommendation-card">
                <div className="skeleton skeleton-thumbnail"></div>
                <div className="recommendation-content">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-meta"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : recommendations.length > 0 && (
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <h3 style={{ textAlign: 'left', margin: '32px 0 16px 8px', color: '#1976d2' }}>Recommended for you</h3>
          <div className="recommendations-grid">
            {recommendations.map((item, idx) => {
              const card = typeof item === 'object' ? item : {};
              return <MovieCard key={idx} card={card} />;
            })}
          </div>
          {!loading && recommendations.length > 0 && (
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
          )}
        </div>
      )}

      <div style={{width: '100%', maxWidth: 1200, margin: '32px auto 0'}}>
        <h3 style={{textAlign: 'left', margin: '32px 0 16px 8px', color: '#1976d2'}}>All Movies</h3>
        <div className="recommendations-grid">
          {allMoviesLoading ? (
            <>
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
            paginatedMovies.map((card, idx) => <MovieCard key={idx} card={card} />)
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
    </header>
  </div>
);

export default MoviesPage;