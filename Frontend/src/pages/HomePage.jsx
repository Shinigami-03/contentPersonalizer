import React from "react";
import styles from "./HomePage.module.css";

import React, { useState } from "react";
import MovieCard from "../components/MovieCard";
import styles from "./HomePage.module.css";

const dummyRecommendations = [
  // Example static recommendations; replace with real data/fetch logic as needed
  { Title: "Inception", Genre: "Sci-Fi", Rating: 8.8, Poster_Url: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg", Overview: "A thief who steals corporate secrets through the use of dream-sharing technology..." },
  { Title: "The Matrix", Genre: "Action", Rating: 8.7, Poster_Url: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", Overview: "A computer hacker learns from mysterious rebels about the true nature of his reality..." }
];

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState(dummyRecommendations);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    // setRecommendations(...)
  };

  return (
    <div className={styles["homepage-container"]}>
      <h1 className={styles["homepage-title"]}>Welcome to Content Personalizer</h1>
      <p className={styles["homepage-description"]}>
        Discover personalized recommendations for movies, music, and articles tailored to your interests. Use the navigation bar to explore different sections and enjoy a seamless, modern experience.
      </p>
      <form onSubmit={handleSearch} style={{ margin: "32px auto", maxWidth: 400, display: "flex", gap: 8 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for content..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #b0bec5", fontSize: 16 }}
        />
        <button type="submit" style={{ borderRadius: 8, background: "#1976d2", color: "#fff", fontWeight: 500, fontSize: 16, padding: "10px 20px", border: "none", cursor: "pointer" }}>Search</button>
      </form>
      <div style={{ width: "100%", maxWidth: 1200, margin: "32px auto 0" }}>
        <h3 style={{ textAlign: "left", margin: "32px 0 16px 8px", color: "#1976d2" }}>Recommended for you</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {recommendations.map((card, idx) => <MovieCard key={idx} card={card} />)}
        </div>
      </div>
    </div>
  );
};

export default HomePage;