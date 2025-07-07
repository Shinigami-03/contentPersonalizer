import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
<<<<<<< HEAD
import Login from './pages/Login';
import Signup from './components/Signup';
import MusicPage from './pages/MusicPage';
import Chatbot from './components/Chatbot';
=======
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MusicPage from './pages/MusicPage';
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(["The Matrix", "Inception"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
<<<<<<< HEAD
  const [showChatbot, setShowChatbot] = useState(false);
=======
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653

  const fetchRecommendations = async (query, page = 1) => {
    console.log('Setting loading to true');
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
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      console.log('Search initiated');
      setHistory(prev => [search, ...prev.filter(q => q !== search)].slice(0, 10));
      setCurrentPage(1); // Reset to first page on new search
      setLoading(true); // Set loading state before fetch
      setTimeout(() => {
        fetchRecommendations(search, 1);
      }, 100); // Small delay to ensure loading state is visible
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchRecommendations(search, newPage);
    }
  };

  useEffect(() => {
    // Initial fetch for recommendations on component mount
    fetchRecommendations("");
  }, []);
<<<<<<< HEAD
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatError(null);
    const userMessage = { sender: "user", text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: chatInput })
      });
      if (!response.ok) throw new Error("Failed to get response from AI");
      const data = await response.json();
      // Add AI answer
      setChatHistory(prev => {
        const newHistory = [...prev, { sender: "ai", text: data.answer }];
        if (data.data_chunks && data.data_chunks.length > 0) {
          newHistory.push({ sender: "ai", text: { type: "data_chunks", chunks: data.data_chunks } });
        }
        return newHistory;
      });
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };
=======
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-logo">
            <img src={logo} alt="Logo" style={{height: 38, marginRight: 12}} />
            <span className="navbar-title">Content Personalizer</span>
          </div>
          <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/music">Music</Link></li>
            <li><Link to="#articles">Articles</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={
<<<<<<< HEAD
            <header className="App-header" style={{background: 'none', color: '#222', paddingTop: '62px'}}>
=======
            <header className="App-header" style={{background: 'none', color: '#222', paddingTop: '62px'}}> {/* Added paddingTop to account for fixed navbar */}
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653
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
<<<<<<< HEAD
              {/* Floating Chatbot Button */}
              <div className="chatbot-fab" onClick={() => setShowChatbot(true)}>
                <img src={logo} alt="Chatbot" className="chatbot-fab-logo" />
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
=======
            </header>
          } />
          <Route path="/movies" element={<MoviesPage recommendations={recommendations} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
>>>>>>> 0644958d0980bf2bb4643d26e91ee45357ce7653
          <Route path="/music" element={<MusicPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
