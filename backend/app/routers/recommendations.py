from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Movie, Rating, User
from ..ml import content_recommender, collab_recommender, hybrid_recommender
from ..utils.helpers import get_current_user
from .movies import movie_to_dict

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


def _all_movies_dicts(db: Session) -> list[dict]:
    movies = db.query(Movie).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "overview": m.overview,
            "genres": m.genres or [],
            "cast": m.cast or [],
            "director": m.director,
            "keywords": m.keywords or [],
            "rating": m.rating,
            "popularity": m.popularity,
        }
        for m in movies
    ]


@router.get("/for-you")
def personalized(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ratings = db.query(Rating).filter(Rating.user_id == current_user.id).all()
    rated_list = [{"movie_id": r.movie_id, "rating": r.rating} for r in ratings]
    all_movies = _all_movies_dicts(db)

    recs = hybrid_recommender.recommend(
        user_id=current_user.id,
        rated_movies=rated_list,
        all_movies=all_movies,
        genre_preferences=current_user.genre_preferences or [],
        n=20,
    )

    results = []
    for rec in recs:
        movie = db.query(Movie).filter(Movie.id == rec["movie_id"]).first()
        if movie:
            d = movie_to_dict(movie, current_user.id, db)
            d["recommendation_score"] = rec["score"]
            d["confidence"] = rec["confidence"]
            d["reason"] = rec["reason"]
            results.append(d)
    return results


@router.get("/similar/{movie_id}")
def similar(movie_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = content_recommender.recommend(movie_id, n=12)
    results = []
    for rec in recs:
        movie = db.query(Movie).filter(Movie.id == rec["movie_id"]).first()
        if movie:
            d = movie_to_dict(movie, current_user.id, db)
            d["similarity_score"] = rec["score"]
            results.append(d)
    return results


@router.get("/trending")
def trending_recs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(20).all()
    return [movie_to_dict(m, current_user.id, db) for m in movies]


@router.get("/similar-users")
def similar_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Find users with similar taste."""
    my_ratings = {r.movie_id: r.rating for r in db.query(Rating).filter(Rating.user_id == current_user.id).all()}
    if not my_ratings:
        return []

    all_users = db.query(User).filter(User.id != current_user.id).all()
    similarities = []

    for user in all_users:
        their_ratings = {r.movie_id: r.rating for r in db.query(Rating).filter(Rating.user_id == user.id).all()}
        common = set(my_ratings.keys()) & set(their_ratings.keys())
        if len(common) < 2:
            continue

        import math
        dot = sum(my_ratings[m] * their_ratings[m] for m in common)
        mag1 = math.sqrt(sum(v ** 2 for v in my_ratings.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in their_ratings.values()))
        sim = dot / (mag1 * mag2) if mag1 and mag2 else 0
        if sim > 0.7:
            similarities.append({
                "user_id": user.id,
                "username": user.username,
                "avatar_url": user.avatar_url,
                "similarity": round(sim, 3),
                "common_movies": len(common),
            })

    similarities.sort(key=lambda x: x["similarity"], reverse=True)
    return similarities[:10]


@router.post("/train")
def train_models(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin only")

    def _train():
        all_movies = _all_movies_dicts(db)
        content_recommender.fit(all_movies)

        all_ratings = db.query(Rating).all()
        if len(all_ratings) >= 5:
            ratings_list = [{"user_id": r.user_id, "movie_id": r.movie_id, "rating": r.rating} for r in all_ratings]
            collab_recommender.fit(ratings_list)

    background_tasks.add_task(_train)
    return {"message": "Training started in background"}


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin only")

    all_ratings = db.query(Rating).all()
    ratings_list = [{"user_id": r.user_id, "movie_id": r.movie_id, "rating": r.rating} for r in all_ratings]
    collab_metrics = collab_recommender.evaluate(ratings_list)
    return {"collaborative": collab_metrics, "total_ratings": len(all_ratings)}
