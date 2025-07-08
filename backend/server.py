from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import sqlite3
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from difflib import SequenceMatcher
import time
import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load movie dataset
def load_movies_dataset():
    db_path = os.path.join(os.path.dirname(__file__), 'dataset', 'movies.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT Release_Date, Title, Overview, Rating, Genre, Poster_Url FROM movies')
    movies = []
    for row in c.fetchall():
        movie = {
            'Release_Date': row[0],
            'Title': row[1],
            'Overview': row[2],
            'Rating': row[3],
            'Genre': row[4],
            'Poster_Url': row[5]
        }
        movies.append(movie)
    conn.close()
    return movies

MOVIES_DATASET = load_movies_dataset()

def load_artists_dataset():
    artists = []
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset', 'MusicArtists.csv')
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            artists.append(row)
    return artists

ARTISTS_DATASET = load_artists_dataset()

def load_music_dataset():
    music = []
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset', 'spotify_music.csv')
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            music.append(row)
    return music

MUSIC_DATASET = load_music_dataset()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
movie_vectors = []
movie_metadata = []
faiss_index = None

def embed_movie_data():
    global movie_vectors, movie_metadata, faiss_index
    texts = []
    movie_metadata.clear()

    for movie in MOVIES_DATASET:
        text = f"{movie['Title']} - {movie['Overview']}"
        texts.append(text)
        movie_metadata.append(movie)

    embeddings = embedding_model.encode(texts, convert_to_numpy=True)
    movie_vectors = embeddings

    dim = embeddings.shape[1]
    faiss_index = faiss.IndexFlatL2(dim)
    faiss_index.add(embeddings)

def recommend_similar_movies(title, top_k=20):
    try:
        index = next(i for i, m in enumerate(movie_metadata) if m['Title'].lower() == title.lower())
        movie_vector = movie_vectors[index].reshape(1, -1)
        similarities = cosine_similarity(movie_vector, movie_vectors)[0]
        similar_indices = similarities.argsort()[::-1][1:top_k+1]
        return [movie_metadata[i] for i in similar_indices]
    except StopIteration:
        return []

def deduplicate_movies(movies):
    seen_titles = set()
    unique_movies = []
    for movie in movies:
        title = movie.get("Title")
        if title and title.lower() not in seen_titles:
            unique_movies.append(movie)
            seen_titles.add(title.lower())
    return unique_movies

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    data_chunks: List[str]

class UserProfile(BaseModel):
    user_id: str
    interests: Optional[List[str]] = None
    history: Optional[List[str]] = None

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    num_items: int = 5
    page: int = 1
    query: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[dict]
    total: int

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    # Semantic Search
    query_embedding = embedding_model.encode([request.query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_embedding, 20)

    semantic_candidates = [movie_metadata[i] for i in indices[0]]
    semantic_scores = np.exp(-distances[0])
    probabilities = semantic_scores / semantic_scores.sum()
    selected_indices = np.random.choice(len(semantic_candidates), size=min(5, len(semantic_candidates)),
                                        replace=False, p=probabilities)
    semantic_movies = deduplicate_movies([semantic_candidates[i] for i in selected_indices])

    # Genre Matching (Fully Dynamic + Random Weighted)
    detected_genres = []
    query_lower = request.query.lower()
    for movie in MOVIES_DATASET:
        genres = movie.get("Genre", "").lower().split(",")
        for genre in genres:
            genre = genre.strip()
            if genre and genre in query_lower:
                detected_genres.append(genre)
    detected_genres = list(set(detected_genres))

    genre_movies = []
    if detected_genres:
        matching_movies = []
        for movie in MOVIES_DATASET:
            movie_genres = [g.strip() for g in movie.get("Genre", "").lower().split(",")]
            if any(g in movie_genres for g in detected_genres):
                matching_movies.append(movie)
        
        if matching_movies:
            ratings = np.array([safe_float(m.get('Rating', 0)) for m in matching_movies])
            ratings = np.clip(ratings, 0.1, None)
            probabilities = ratings / ratings.sum()
            num_samples = min(5, len(matching_movies))
            sampled_indices = np.random.choice(len(matching_movies), size=num_samples, replace=False, p=probabilities)
            genre_movies = deduplicate_movies([matching_movies[i] for i in sampled_indices])

    # Similar Movies Randomized
    similar_candidates = recommend_similar_movies(request.query, top_k=20)
    np.random.shuffle(similar_candidates)
    similar_movies = deduplicate_movies(similar_candidates[:5])

    # Build response
    answer = "Here are some recommendations:\n\n"
    if semantic_movies:
        answer += "**Semantic Matches:**\n" + "\n".join(
            [f"{m['Title']} ({m['Release_Date']}) - {m['Genre']} | Rating: {m['Rating']}" for m in semantic_movies]
        ) + "\n\n"
    else:
        answer += "**Semantic Matches:**\nNo matches found.\n\n"

    if detected_genres and genre_movies:
        genre_list = ", ".join([g.capitalize() for g in detected_genres])
        answer += f"**Genre Matches ({genre_list}):**\n" + "\n".join(
            [f"{m['Title']} ({m['Release_Date']}) - {m['Genre']} | Rating: {m['Rating']}" for m in genre_movies]
        ) + "\n\n"
    elif detected_genres:
        genre_list = ", ".join([g.capitalize() for g in detected_genres])
        answer += f"**Genre Matches ({genre_list}):**\nNo matches found.\n\n"

    if similar_movies:
        answer += "**Similar Movies:**\n" + "\n".join(
            [f"{m['Title']} ({m['Release_Date']}) - {m['Genre']} | Rating: {m['Rating']}" for m in similar_movies]
        ) + "\n\n"
    else:
        answer += "**Similar Movies:**\nNo matches found.\n\n"

    return QueryResponse(answer=answer, data_chunks=[answer])

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_content(req: RecommendationRequest, ai_only: bool = Query(False)):
    query_title = req.query if req.query else (req.user_profile.history[0] if req.user_profile.history else None)
    query_genres = req.user_profile.interests if req.user_profile.interests else None

    results = []
    for movie in MOVIES_DATASET:
        score = 0
        if query_title:
            score += SequenceMatcher(None, query_title.lower(), movie.get("Title", "").lower()).ratio()
        if query_genres:
            movie_genres = [g.strip() for g in movie.get("Genre", "").lower().split(",")]
            for genre in query_genres:
                if genre.lower() in movie_genres:
                    score += 0.5

        if score > 0:
            results.append((score, movie))

    results.sort(reverse=True, key=lambda x: x[0])
    all_matches = [m for _, m in results]
    total = len(all_matches)
    start = (req.page - 1) * req.num_items
    end = start + req.num_items
    paginated = all_matches[start:end]

    return RecommendationResponse(recommendations=paginated, total=total)

@app.get("/all-movies")
def get_all_movies():
    return JSONResponse(content=MOVIES_DATASET)

@app.get("/all-artists")
def get_all_artists():
    return JSONResponse(content=ARTISTS_DATASET)

@app.get("/all-music")
def get_all_music():
    return JSONResponse(content=MUSIC_DATASET)

def safe_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0

@app.on_event("startup")
def startup_event():
    start_time = time.time()
    embed_movie_data()
    end_time = time.time()
    print(f"[Startup] Embedding and FAISS indexing completed in {end_time - start_time:.2f} seconds.")
