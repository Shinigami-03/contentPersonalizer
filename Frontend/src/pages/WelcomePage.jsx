import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: '#fff'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }} />
      <div style={{ zIndex: 2, textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          Welcome to Content Personalizer
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: 40, textShadow: '1px 1px 6px rgba(0,0,0,0.6)' }}>
          Discover personalized content tailored just for you.
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 32px',
              fontSize: '1.2rem',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '16px 32px',
              fontSize: '1.2rem',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(67, 160, 71, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.3)';
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;