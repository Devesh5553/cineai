from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from ..database import get_db
from ..models.models import User, Movie, Rating, Watchlist, Favorite, RecentlyViewed
from ..utils.helpers import get_current_user
from .movies import movie_to_dict

router = APIRouter(prefix="/api/users", tags=["users"])


class OnboardingRequest(BaseModel):
    genre_preferences: List[str]
    favorite_movie_ids: List[int] = []


class ProfileUpdateRequest(BaseModel):
    username: str = None
    bio: str = None
    avatar_url: str = None


@router.get("/me/watchlist")
def get_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = (
        db.query(Movie)
        .join(Watchlist, Watchlist.movie_id == Movie.id)
        .filter(Watchlist.user_id == current_user.id)
        .order_by(Watchlist.created_at.desc())
        .all()
    )
    return [movie_to_dict(m, current_user.id, db) for m in entries]


@router.get("/me/favorites")
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = (
        db.query(Movie)
        .join(Favorite, Favorite.movie_id == Movie.id)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [movie_to_dict(m, current_user.id, db) for m in entries]


@router.get("/me/recently-viewed")
def recently_viewed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = (
        db.query(Movie)
        .join(RecentlyViewed, RecentlyViewed.movie_id == Movie.id)
        .filter(RecentlyViewed.user_id == current_user.id)
        .order_by(RecentlyViewed.viewed_at.desc())
        .limit(20)
        .all()
    )
    return [movie_to_dict(m, current_user.id, db) for m in entries]


@router.get("/me/ratings")
def get_ratings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ratings = (
        db.query(Rating, Movie)
        .join(Movie, Rating.movie_id == Movie.id)
        .filter(Rating.user_id == current_user.id)
        .order_by(Rating.created_at.desc())
        .all()
    )
    return [
        {**movie_to_dict(m, current_user.id, db), "user_rating": r.rating, "rated_at": str(r.created_at)}
        for r, m in ratings
    ]


@router.post("/me/onboarding")
def complete_onboarding(
    body: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.genre_preferences = body.genre_preferences
    current_user.onboarding_complete = True
    db.commit()

    # Pre-rate favorite movies at 5
    for mid in body.favorite_movie_ids:
        existing = db.query(Rating).filter(Rating.user_id == current_user.id, Rating.movie_id == mid).first()
        if not existing:
            db.add(Rating(user_id=current_user.id, movie_id=mid, rating=5.0))
    db.commit()

    return {"message": "Onboarding complete", "genre_preferences": body.genre_preferences}


@router.put("/me/profile")
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.username:
        existing = db.query(User).filter(User.username == body.username, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = body.username
    if body.bio is not None:
        current_user.bio = body.bio
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "is_admin": current_user.is_admin,
        "onboarding_complete": current_user.onboarding_complete,
        "genre_preferences": current_user.genre_preferences or [],
    }


@router.get("/me/stats")
def user_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_ratings = db.query(func.count(Rating.id)).filter(Rating.user_id == current_user.id).scalar()
    avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.user_id == current_user.id).scalar()
    watchlist_count = db.query(func.count(Watchlist.id)).filter(Watchlist.user_id == current_user.id).scalar()
    favorites_count = db.query(func.count(Favorite.id)).filter(Favorite.user_id == current_user.id).scalar()

    # Genre distribution from ratings
    rated_movies = (
        db.query(Movie)
        .join(Rating, Rating.movie_id == Movie.id)
        .filter(Rating.user_id == current_user.id)
        .all()
    )
    genre_counts: dict[str, int] = {}
    for m in rated_movies:
        for g in (m.genres or []):
            genre_counts[g] = genre_counts.get(g, 0) + 1

    # Rating distribution
    rating_dist = {}
    for r in db.query(Rating).filter(Rating.user_id == current_user.id).all():
        key = str(int(r.rating))
        rating_dist[key] = rating_dist.get(key, 0) + 1

    return {
        "total_ratings": total_ratings,
        "avg_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "watchlist_count": watchlist_count,
        "favorites_count": favorites_count,
        "genre_distribution": genre_counts,
        "rating_distribution": rating_dist,
    }


@router.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return {
        "total_users": db.query(func.count(User.id)).scalar(),
        "total_movies": db.query(func.count(Movie.id)).scalar(),
        "total_ratings": db.query(func.count(Rating.id)).scalar(),
        "total_reviews": db.query(func.count(Rating.id)).scalar(),
    }
