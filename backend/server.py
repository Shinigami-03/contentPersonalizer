
# === server.py ===
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import csv
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import csv
import os
from fastapi.responses import JSONResponse
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOVIES_DATASET = []
MOVIES_CSV_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'Movies.csv')

with open(MOVIES_CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        MOVIES_DATASET.append(row)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    data_chunks: List[str]

class RecommendationRequest(BaseModel):
    query: str = None
    num_items: int = 6
    page: int = 1
    user_profile: dict = None

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

def search_semantic_movies(query, top_k=5):
    query_embedding = embedding_model.encode([query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_embedding, top_k)
    return [movie_metadata[i] for i in indices[0]]

def search_with_rules(query, top_k=5):
    base_results = search_semantic_movies(query, top_k=100)
    query_lower = query.lower()

    for year in range(1950, 2030):
        if str(year) in query:
            base_results = [m for m in base_results if m.get("Release_Date", "").startswith(str(year))]
            break

    if "highest rating" in query_lower or "top rated" in query_lower:
        base_results.sort(key=lambda m: float(m.get("Rating", 0)), reverse=True)
    elif "lowest rating" in query_lower or "worst rated" in query_lower:
        base_results.sort(key=lambda m: float(m.get("Rating", 0)))

    if "action" in query_lower:
        base_results = [m for m in base_results if "action" in m.get("Genre", "").lower()]
    elif "comedy" in query_lower:
        base_results = [m for m in base_results if "comedy" in m.get("Genre", "").lower()]

    return base_results[:top_k]

def recommend_similar_movies(title, top_k=5):
    try:
        index = next(i for i, m in enumerate(movie_metadata) if m['Title'].lower() == title.lower())
        movie_vector = movie_vectors[index].reshape(1, -1)
        similarities = cosine_similarity(movie_vector, movie_vectors)[0]
        similar_indices = similarities.argsort()[::-1][1:top_k+1]
        return [movie_metadata[i] for i in similar_indices]
    except StopIteration:
        return []

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_movies(request: RecommendationRequest):
    relevant_movies = search_semantic_movies(request.query, top_k=100) if request.query else MOVIES_DATASET
    if request.query:
        relevant_movies = search_with_rules(request.query, top_k=len(relevant_movies))
    start_index = (request.page - 1) * request.num_items
    end_index = start_index + request.num_items
    paginated_movies = relevant_movies[start_index:end_index]
    return RecommendationResponse(recommendations=paginated_movies, total=len(relevant_movies))

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    relevant_movies = search_with_rules(request.query, top_k=5)
    data_chunks = [f"{m['Title']} ({m['Release_Date']}) - {m['Genre']}\nRating: {m['Rating']}\n{m['Overview']}" for m in relevant_movies]
    answer = "Here are some movies you might enjoy:\n\n" + "\n\n".join(data_chunks)
    return QueryResponse(answer=answer, data_chunks=data_chunks)

@app.post("/similar", response_model=RecommendationResponse)
async def similar_movies(request: QueryRequest):
    similar = recommend_similar_movies(request.query)
    return RecommendationResponse(recommendations=similar, total=len(similar))

@app.on_event("startup")
def load_embeddings():
    embed_movie_data()

@app.get("/all-movies")
def get_all_movies():
    return MOVIES_DATASET

# --- RAG Pipeline Components (Stubs) ---
# In a real system, these would use libraries like langchain, llama-cpp-python, sentence-transformers, faiss/chromadb, etc.

def retrieve_documents(user_profile, query, top_k=10):
    # Simulate retrieval: always include the query in the results
    docs = []
    if query:
        docs.append(f"Result for '{query}' (AI generated)")
    # Add some personalized/history-based results
    if user_profile.history:
        docs.extend([f"Because you searched: {h}" for h in user_profile.history[:top_k-1]])
    # Fallback generic content
    while len(docs) < top_k:
        docs.append(f"Popular content {len(docs)+1}")
    return docs[:top_k]

def generate_personalized_response(context_docs, user_profile, query):
    # Simulate LLM response: return the docs as recommendations
    return [
        f"{doc}" for doc in context_docs
    ]

from fastapi import Query

def init_db_from_csv():
    db_path = os.path.join(os.path.dirname(__file__), 'dataset', 'movies.db')
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset', 'Movies.csv')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Release_Date TEXT,
        Title TEXT,
        Overview TEXT,
        Rating REAL,
        Genre TEXT,
        Poster_Url TEXT
    )''')
    with open(csv_path, encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('''INSERT OR IGNORE INTO movies (Release_Date, Title, Overview, Rating, Genre, Poster_Url) VALUES (?, ?, ?, ?, ?, ?)''',
                      (row['Release_Date'], row['Title'], row['Overview'], row['Rating'], row['Genre'], row['Poster_Url']))
    conn.commit()
    conn.close()

init_db_from_csv()

def init_music_db_from_csv():
    db_path = os.path.join(os.path.dirname(__file__), 'dataset', 'music.db')
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset', 'spotify_music.csv')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS music (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        artist TEXT,
        top_genre TEXT,
        year INTEGER,
        bpm INTEGER,
        nrgy INTEGER,
        dnce INTEGER,
        dB INTEGER,
        live INTEGER,
        val INTEGER,
        dur INTEGER,
        acous INTEGER,
        spch INTEGER,
        pop INTEGER
    )''')
    with open(csv_path, encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('''INSERT OR IGNORE INTO music (title, artist, top_genre, year, bpm, nrgy, dnce, dB, live, val, dur, acous, spch, pop) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                      (row['title'], row['artist'], row['top genre'], row['year'], row['bpm'], row['nrgy'], row['dnce'], row['dB'], row['live'], row['val'], row['dur'], row['acous'], row['spch'], row['pop']))
    conn.commit()
    conn.close()

init_music_db_from_csv()

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

def find_similar_movies(query_title=None, query_genres=None, top_k=None):
    from difflib import SequenceMatcher
    results = []
    for movie in MOVIES_DATASET:
        title = movie.get('Title')
        genres = movie.get('Genre')
        score = 0
        if query_title and title:
            score += SequenceMatcher(None, query_title.lower(), title.lower()).ratio()
        if query_genres and genres:
            for genre in query_genres:
                if genre.lower() in genres.lower():
                    score += 0.5
        if score > 0:
            results.append((score, movie))
    results.sort(reverse=True, key=lambda x: x[0])
    if top_k:
        return [m for _, m in results[:top_k]]
    return [m for _, m in results]

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_content(req: RecommendationRequest, ai_only: bool = Query(False, description="Return only AI-generated content")):
    query = getattr(req, 'query', None)
    query_title = query if query else (req.user_profile.history[0] if req.user_profile.history else None)
    query_genres = req.user_profile.interests if req.user_profile.interests else None
    
    # Get all matching movies first
    all_matches = find_similar_movies(query_title=query_title, query_genres=query_genres, top_k=len(MOVIES_DATASET))
    total_matches = len(all_matches)
    
    # Calculate pagination
    start_idx = (req.page - 1) * req.num_items
    end_idx = start_idx + req.num_items
    
    # Get paginated results
    paginated_matches = all_matches[start_idx:end_idx]
    
    return RecommendationResponse(
        recommendations=paginated_matches,
        total=total_matches
    )

def load_music_dataset():
    db_path = os.path.join(os.path.dirname(__file__), 'dataset', 'music.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor() 
    c.execute('SELECT title, artist, top_genre, year, bpm, nrgy, dnce, dB, live, val, dur, acous, spch, pop FROM music')
    music = []
    for row in c.fetchall():
        song = {
            'title': row[0],
            'artist': row[1],
            'top_genre': row[2],
            'year': row[3],
            'bpm': row[4],
            'nrgy': row[5],
            'dnce': row[6],
            'dB': row[7],
            'live': row[8],
            'val': row[9],
            'dur': row[10],
            'acous': row[11],
            'spch': row[12],
            'pop': row[13]
        }
        music.append(song)
    conn.close()
    return music

@app.get("/all-movies")
def get_all_movies():
    movies = load_movies_dataset()
    return JSONResponse(content=movies)

@app.get("/all-music")
def get_all_music():
    music = load_music_dataset()
    return JSONResponse(content=music)

@app.get("/all-artists")
def get_all_artists():
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset', 'MusicArtists.csv')
    artists = []
    with open(csv_path, encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            artists.append(row)
    return JSONResponse(content=artists)

