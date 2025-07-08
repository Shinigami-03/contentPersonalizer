import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import MoviesPage from './pages/MoviesPage';
import Login from './pages/Login';
import Signup from './components/Signup';
import MusicPage from './pages/MusicPage';
import Chatbot from './components/Chatbot';
import ArtistPage from './pages/ArtistPage';
import WelcomePage from './pages/WelcomePage';
import chatbotLogo from './Assets/chatbot.png';

function Layout({
  recommendations,
  loading,
  error,
  search,
  setSearch,
  handleSearch,
  itemsPerPage,
  handlePageChange,
  currentPage,
  totalPages,
  showChatbot,
  setShowChatbot
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ["/", "/login", "/signup"].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="App">
      {!hideNavbar && (
        <nav className="navbar">
          <div className="navbar-logo">
            <img src={chatbotLogo} alt="Logo" style={{height: 38, marginRight: 12}} />
            <span className="navbar-title">Content Personalizer</span>
          </div>
          <ul className="navbar-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/music">Music</Link></li>
            <li><Link to="/artist">Artist</Link></li>
            <li>
              <button onClick={handleLogout} className="navbar-link" style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'}} aria-label="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{background: 'transparent'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </li>
          </ul>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={
          <header className="App-header" style={{background: 'none', color: '#222', paddingTop: '62px'}}>
            <h2>Content Personalization Agent</h2>
            <form onSubmit={handleSearch} className="search-bar">
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
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-meta"></div>
                      <div className="skeleton skeleton-meta"></div>
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
                    return (
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
                    );
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
            {/* Floating Chatbot Button */}
            <div className="chatbot-fab" onClick={() => setShowChatbot(true)}>
              <img src={chatbotLogo} alt="Chatbot" className="chatbot-fab-logo" />
            </div>
            {/* Chatbot Modal */}
            {showChatbot && (
              <div className="chatbot-modal-overlay" onClick={() => setShowChatbot(false)}>
                <div className="chatbot-modal" onClick={e => e.stopPropagation()}>
                  <button className="chatbot-modal-close" onClick={() => setShowChatbot(false)}>&times;</button>
                  <Chatbot />
                </div>
              </div>
            )}
          </header>
        } />
        <Route path="/movies" element={<MoviesPage recommendations={recommendations} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/artist" element={<ArtistPage />} />
      </Routes>
    </div>
  );
}

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(["The Matrix", "Inception"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [showChatbot, setShowChatbot] = useState(false);

  const fetchRecommendations = async (query, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_profile: {
            user_id: 'user123',
            interests: ['AI', 'Music', 'Movies'],
            history: history,
          },
          num_items: itemsPerPage,
          page: page,
          query: query || undefined
        })
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      // Filter out duplicate recommendations based on Title
      const uniqueRecommendations = [];
      const seenTitles = new Set();
      data.recommendations.forEach(rec => {
        if (!seenTitles.has(rec.Title)) {
          uniqueRecommendations.push(rec);
          seenTitles.add(rec.Title);
        }
      });
      setRecommendations(uniqueRecommendations);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setHistory(prev => [search, ...prev.filter(q => q !== search)].slice(0, 10));
      setCurrentPage(1);
      setLoading(true);
      setTimeout(() => {
        fetchRecommendations(search, 1);
      }, 100);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchRecommendations(search, newPage);
    }
  };

  useEffect(() => {
    fetchRecommendations("");
  }, []);

  return (
    <Layout
      recommendations={recommendations}
      loading={loading}
      error={error}
      search={search}
      setSearch={setSearch}
      handleSearch={handleSearch}
      itemsPerPage={itemsPerPage}
      handlePageChange={handlePageChange}
      currentPage={currentPage}
      totalPages={totalPages}
      showChatbot={showChatbot}
      setShowChatbot={setShowChatbot}
    />
  );
}

export default App;
