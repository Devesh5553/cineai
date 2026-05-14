from .content_based import content_recommender
from .collaborative import collab_recommender


class HybridRecommender:
    def __init__(self, content_weight: float = 0.4, collab_weight: float = 0.6):
        self.content_weight = content_weight
        self.collab_weight = collab_weight

    def recommend(
        self,
        user_id: int,
        rated_movies: list[dict],
        all_movies: list[dict],
        genre_preferences: list[str] = None,
        n: int = 20,
    ) -> list[dict]:
        all_movie_ids = [m["id"] for m in all_movies]
        rated_ids = {r["movie_id"] for r in rated_movies}
        movie_lookup = {m["id"]: m for m in all_movies}

        scores: dict[int, float] = {}

        # Content-based: aggregate scores from all rated movies
        for rated in rated_movies:
            if rated["rating"] < 3:
                continue
            cb_recs = content_recommender.recommend(rated["movie_id"], n=30)
            weight = rated["rating"] / 5.0
            for rec in cb_recs:
                mid = rec["movie_id"]
                if mid not in rated_ids:
                    scores[mid] = scores.get(mid, 0) + rec["score"] * weight * self.content_weight

        # Collaborative filtering scores
        collab_recs = collab_recommender.recommend(user_id, all_movie_ids, rated_ids, n=50)
        for rec in collab_recs:
            mid = rec["movie_id"]
            scores[mid] = scores.get(mid, 0) + rec["score"] * self.collab_weight

        # Cold-start: if no ratings, use genre preferences
        if not rated_movies and genre_preferences:
            genre_recs = content_recommender.recommend_for_genres(genre_preferences, all_movies, n=50)
            for mid in genre_recs:
                movie = movie_lookup.get(mid, {})
                scores[mid] = scores.get(mid, 0) + movie.get("rating", 0) * 0.3

        # Fallback: popularity-based
        if not scores:
            for m in sorted(all_movies, key=lambda x: x.get("popularity", 0), reverse=True)[:n]:
                if m["id"] not in rated_ids:
                    scores[m["id"]] = m.get("rating", 0) * 0.1

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:n]

        results = []
        for mid, score in sorted_scores:
            movie = movie_lookup.get(mid)
            if movie:
                reason = self._explain(mid, rated_movies, genre_preferences, movie_lookup)
                results.append({
                    "movie_id": mid,
                    "score": round(score, 4),
                    "confidence": min(round(score / 5.0, 2), 1.0),
                    "reason": reason,
                })
        return results

    def _explain(
        self,
        movie_id: int,
        rated_movies: list[dict],
        genre_preferences: list[str],
        movie_lookup: dict,
    ) -> str:
        movie = movie_lookup.get(movie_id)
        if not movie:
            return "Recommended for you"

        if rated_movies:
            best_match = None
            best_score = 0
            for rated in rated_movies:
                if rated["rating"] < 3.5:
                    continue
                cb = content_recommender.recommend(rated["movie_id"], n=20)
                for rec in cb:
                    if rec["movie_id"] == movie_id and rec["score"] > best_score:
                        best_score = rec["score"]
                        best_match = movie_lookup.get(rated["movie_id"])
            if best_match:
                return f"Because you liked {best_match['title']}"

        if genre_preferences:
            movie_genres = movie.get("genres", [])
            matched = [g for g in movie_genres if g in genre_preferences]
            if matched:
                return f"Matches your interest in {matched[0]}"

        return f"Trending in {movie.get('genres', ['Movies'])[0] if movie.get('genres') else 'Movies'}"


hybrid_recommender = HybridRecommender()
