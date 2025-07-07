import React, { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard";

function ArtistPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/all-artists");
        if (!response.ok) throw new Error("Failed to fetch artists");
        const data = await response.json();
        setArtists(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentArtists = artists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div style={{ paddingTop: "62px", textAlign: "center" }}>
        <h2>All Artists</h2>
        <div className="recommendations-grid">
          {Array(itemsPerPage).fill().map((_, idx) => (
            <div key={`artist-skeleton-${idx}`} className="recommendation-card">
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
    return <div style={{ paddingTop: "62px", textAlign: "center", color: "red" }}>Error: {error}</div>;
  }
  return (
    <div style={{ paddingTop: "62px", textAlign: "center" }}>
      <h2>All Artists</h2>
      <div className="recommendations-grid">
        {currentArtists.map((artist, idx) => (
          <ArtistCard key={artist.artist_id || idx} artist={artist} />
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Previous</button>
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">Next</button>
      </div>
    </div>
  );
}

export default ArtistPage;