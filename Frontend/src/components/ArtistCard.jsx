import React from "react";
import "../App.css";

const ArtistCard = ({ artist }) => (
  <div className="recommendation-card">
    <img
      className="recommendation-thumbnail"
      src={artist.artist_img || "https://via.placeholder.com/320x180?text=Artist"}
      alt={artist.artist_name}
      style={{ width: "100%", height: 200, objectFit: "cover", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
    />
    <div className="recommendation-content" style={{ padding: 16 }}>
      <div className="recommendation-title" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#1976d2" }}>{artist.artist_name}</div>
      <div className="recommendation-meta" style={{ fontSize: 15, marginBottom: 8, color: "#555" }}>
        <span><b>Genre:</b> {artist.artist_genre}</span><br />
        <span><b>Country:</b> {artist.country}</span>
      </div>
    </div>
  </div>
);

export default ArtistCard;