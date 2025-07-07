import React from "react";
import styles from "./MovieCard.module.css";

const MovieCard = ({ card }) => (
  <div className={styles["recommendation-card"]}>
    <img className={styles["recommendation-thumbnail"]} src={card.Poster_Url || card.LocalPoster || card.Poster || 'https://via.placeholder.com/320x180?text=Thumbnail'} alt="thumbnail" />
    <div className={styles["recommendation-content"]}>
      <div className={styles["recommendation-title"]}>{card.Title}</div>
      <div className={styles["recommendation-meta"]}>
        {card.Genre && <span><b>Genre:</b> {card.Genre} &nbsp;</span>}
        {card.Rating && <span className={styles["recommendation-rating"]}><b>★ {card.Rating}</b></span>}
      </div>
      {card.Overview && <div className={styles["recommendation-overview"]}>{card.Overview}</div>}
    </div>
  </div>
);

export default MovieCard;