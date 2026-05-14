import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent.parent / "saved_models"
MODEL_PATH.mkdir(exist_ok=True)


class ContentBasedRecommender:
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        self.sim_matrix = None
        self.movie_ids = []
        self.movie_index = {}

    def _build_soup(self, movie: dict) -> str:
        genres = " ".join(movie.get("genres", []))
        cast = " ".join(movie.get("cast", [])[:5])
        director = movie.get("director", "")
        keywords = " ".join(movie.get("keywords", []))
        overview = movie.get("overview", "")
        return f"{overview} {genres} {cast} {director} {keywords}".lower()

    def fit(self, movies: list[dict]):
        self.movie_ids = [m["id"] for m in movies]
        self.movie_index = {mid: i for i, mid in enumerate(self.movie_ids)}

        soups = [self._build_soup(m) for m in movies]
        tfidf_matrix = self.tfidf.fit_transform(soups)
        self.sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

        self._save()

    def recommend(self, movie_id: int, n: int = 10) -> list[dict]:
        if movie_id not in self.movie_index:
            return []
        idx = self.movie_index[movie_id]
        scores = list(enumerate(self.sim_matrix[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)[1 : n + 1]
        return [
            {"movie_id": self.movie_ids[i], "score": float(s)}
            for i, s in scores
        ]

    def recommend_for_genres(self, genres: list[str], all_movies: list[dict], n: int = 10) -> list[int]:
        genre_set = set(g.lower() for g in genres)
        scored = []
        for m in all_movies:
            movie_genres = set(g.lower() for g in m.get("genres", []))
            overlap = len(genre_set & movie_genres)
            if overlap > 0:
                scored.append((m["id"], overlap + m.get("rating", 0) * 0.1))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [mid for mid, _ in scored[:n]]

    def _save(self):
        with open(MODEL_PATH / "content_based.pkl", "wb") as f:
            pickle.dump(
                {
                    "tfidf": self.tfidf,
                    "sim_matrix": self.sim_matrix,
                    "movie_ids": self.movie_ids,
                },
                f,
            )

    def load(self) -> bool:
        path = MODEL_PATH / "content_based.pkl"
        if not path.exists():
            return False
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.tfidf = data["tfidf"]
        self.sim_matrix = data["sim_matrix"]
        self.movie_ids = data["movie_ids"]
        self.movie_index = {mid: i for i, mid in enumerate(self.movie_ids)}
        return True

    def evaluate(self, test_pairs: list[tuple]) -> dict:
        """Precision@K and Recall@K evaluation."""
        precisions, recalls = [], []
        for movie_id, relevant_ids in test_pairs:
            recs = self.recommend(movie_id, n=10)
            rec_ids = set(r["movie_id"] for r in recs)
            relevant_set = set(relevant_ids)
            if not relevant_set:
                continue
            precision = len(rec_ids & relevant_set) / len(rec_ids) if rec_ids else 0
            recall = len(rec_ids & relevant_set) / len(relevant_set)
            precisions.append(precision)
            recalls.append(recall)
        return {
            "precision_at_k": float(np.mean(precisions)) if precisions else 0,
            "recall_at_k": float(np.mean(recalls)) if recalls else 0,
        }


content_recommender = ContentBasedRecommender()
