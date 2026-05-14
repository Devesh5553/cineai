import pickle
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent.parent / "saved_models"
MODEL_PATH.mkdir(exist_ok=True)


class CollaborativeRecommender:
    def __init__(self):
        self.algo = None
        self.trainset = None
        self._available = False
        self._check_surprise()

    def _check_surprise(self):
        try:
            from surprise import SVD, Dataset, Reader, accuracy
            from surprise.model_selection import cross_validate
            self._available = True
        except ImportError:
            self._available = False

    def fit(self, ratings: list[dict]):
        """ratings: [{"user_id": int, "movie_id": int, "rating": float}]"""
        if not self._available or len(ratings) < 5:
            return False
        try:
            from surprise import SVD, Dataset, Reader
            import pandas as pd

            df = pd.DataFrame(ratings)
            reader = Reader(rating_scale=(1, 5))
            data = Dataset.load_from_df(df[["user_id", "movie_id", "rating"]], reader)
            self.trainset = data.build_full_trainset()
            self.algo = SVD(n_factors=50, n_epochs=20, random_state=42)
            self.algo.fit(self.trainset)
            self._save()
            return True
        except Exception:
            return False

    def predict(self, user_id: int, movie_id: int) -> float:
        if not self.algo:
            return 0.0
        try:
            pred = self.algo.predict(str(user_id), str(movie_id))
            return float(pred.est)
        except Exception:
            return 0.0

    def recommend(self, user_id: int, all_movie_ids: list[int], rated_movie_ids: set, n: int = 10) -> list[dict]:
        if not self.algo:
            return []
        candidates = [mid for mid in all_movie_ids if mid not in rated_movie_ids]
        predictions = [(mid, self.predict(user_id, mid)) for mid in candidates]
        predictions.sort(key=lambda x: x[1], reverse=True)
        return [{"movie_id": mid, "score": score} for mid, score in predictions[:n]]

    def evaluate(self, ratings: list[dict]) -> dict:
        if not self._available or not self.algo or len(ratings) < 5:
            return {"rmse": 0.0}
        try:
            from surprise import Dataset, Reader, accuracy
            import pandas as pd

            df = pd.DataFrame(ratings)
            reader = Reader(rating_scale=(1, 5))
            data = Dataset.load_from_df(df[["user_id", "movie_id", "rating"]], reader)
            testset = data.build_full_trainset().build_testset()
            predictions = self.algo.test(testset)
            rmse = accuracy.rmse(predictions, verbose=False)
            return {"rmse": float(rmse)}
        except Exception:
            return {"rmse": 0.0}

    def _save(self):
        with open(MODEL_PATH / "collaborative.pkl", "wb") as f:
            pickle.dump(self.algo, f)

    def load(self) -> bool:
        path = MODEL_PATH / "collaborative.pkl"
        if not path.exists() or not self._available:
            return False
        try:
            with open(path, "rb") as f:
                self.algo = pickle.load(f)
            return True
        except Exception:
            return False


collab_recommender = CollaborativeRecommender()
