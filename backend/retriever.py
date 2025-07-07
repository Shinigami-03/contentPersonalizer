# retriever.py

import os
import requests
from dotenv import load_dotenv
import logging
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

load_dotenv()

LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")
LLAMA_PIPELINE_URL = "https://api.cloud.llamaindex.ai/api/v1/pipelines/ea201393-ba62-4206-8422-d45d03bb3809/retrieve"

logging.basicConfig(level=logging.INFO)

model = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory vector store
index = None
text_chunks = []


def retrieve_nodes(query):
    try:
        headers = {"Authorization": f"Bearer {LLAMA_API_KEY}", "Content-Type": "application/json"}
        payload = {"query": query}
        response = requests.post(LLAMA_PIPELINE_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        retrieval_nodes_list = data.get('retrieval_nodes', [])

        all_texts = []

        for element in retrieval_nodes_list:
            text = element.get('node', {}).get('text')
            if text:
                all_texts.append(text)

        return all_texts
    except Exception as e:
        logging.error(f"Error retrieving nodes: {e}")
        return []


def build_faiss_index(texts):
    global index, text_chunks
    text_chunks = texts
    embeddings = model.encode(texts)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))


def semantic_search(query, top_k=5):
    if not index or not text_chunks:
        return []
    query_vector = model.encode([query])
    D, I = index.search(np.array(query_vector), top_k)
    return [text_chunks[i] for i in I[0] if i < len(text_chunks)]


def query_index(query):
    try:
        nodes = retrieve_nodes(query)
        if nodes:
            build_faiss_index(nodes)
            relevant_chunks = semantic_search(query)
            return {
                "answer": f"I found {len(relevant_chunks)} relevant pieces of information.",
                "data_chunks": relevant_chunks
            }
        else:
            return {"answer": "Sorry, I couldn't find anything relevant.", "data_chunks": []}
    except Exception as e:
        logging.error(f"Error in query_index: {e}")
        return {"answer": "An error occurred while processing your query.", "data_chunks": []}
