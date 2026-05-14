from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from ..database import get_db
from ..models.models import Movie, Rating, Watchlist, Favorite, RecentlyViewed, Review, User
from ..utils.helpers import get_current_user
from ..ml.sentiment import analyze_sentiment

router = APIRouter(prefix="/api/movies", tags=["movies"])


def movie_to_dict(movie: Movie, user_id: int = None, db: Session = None) -> dict:
    avg_rating = None
    user_rating = None
    in_watchlist = False
    in_favorites = False

    if db and user_id:
        avg = db.query(func.avg(Rating.rating)).filter(Rating.movie_id == movie.id).scalar()
        avg_rating = round(float(avg), 2) if avg else None
        ur = db.query(Rating).filter(Rating.user_id == user_id, Rating.movie_id == movie.id).first()
        user_rating = ur.rating if ur else None
        in_watchlist = bool(db.query(Watchlist).filter(Watchlist.user_id == user_id, Watchlist.movie_id == movie.id).first())
        in_favorites = bool(db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.movie_id == movie.id).first())

    return {
        "id": movie.id,
        "tmdb_id": movie.tmdb_id,
        "title": movie.title,
        "overview": movie.overview,
        "poster_url": movie.poster_url,
        "backdrop_url": movie.backdrop_url,
        "genres": movie.genres or [],
        "cast": movie.cast or [],
        "director": movie.director,
        "release_year": movie.release_year,
        "rating": movie.rating,
        "vote_count": movie.vote_count,
        "runtime": movie.runtime,
        "language": movie.language,
        "keywords": movie.keywords or [],
        "trailer_url": movie.trailer_url,
        "popularity": movie.popularity,
        "avg_user_rating": avg_rating,
        "user_rating": user_rating,
        "in_watchlist": in_watchlist,
        "in_favorites": in_favorites,
    }


@router.get("")
def list_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "popularity",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Movie)
    if search:
        q = q.filter(or_(Movie.title.ilike(f"%{search}%"), Movie.overview.ilike(f"%{search}%")))
    if genre:
        q = q.filter(Movie.genres.contains(genre))
    if sort == "rating":
        q = q.order_by(Movie.rating.desc())
    elif sort == "year":
        q = q.order_by(Movie.release_year.desc())
    elif sort == "title":
        q = q.order_by(Movie.title.asc())
    else:
        q = q.order_by(Movie.popularity.desc())

    total = q.count()
    movies = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "movies": [movie_to_dict(m, current_user.id, db) for m in movies],
    }


@router.get("/trending")
def trending(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(20).all()
    return [movie_to_dict(m, current_user.id, db) for m in movies]


@router.get("/top-rated")
def top_rated(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    movies = db.query(Movie).order_by(Movie.rating.desc()).limit(20).all()
    return [movie_to_dict(m, current_user.id, db) for m in movies]


@router.get("/genres")
def get_genres(db: Session = Depends(get_db)):
    movies = db.query(Movie.genres).all()
    genre_set = set()
    for (genres,) in movies:
        if genres:
            genre_set.update(genres)
    return sorted(list(genre_set))


@router.get("/{movie_id}")
def get_movie(movie_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Track recently viewed
    rv = db.query(RecentlyViewed).filter(
        RecentlyViewed.user_id == current_user.id,
        RecentlyViewed.movie_id == movie_id,
    ).first()
    if rv:
        db.delete(rv)
    db.add(RecentlyViewed(user_id=current_user.id, movie_id=movie_id))
    db.commit()

    return movie_to_dict(movie, current_user.id, db)


@router.post("/{movie_id}/rate")
def rate_movie(
    movie_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rating_val = float(body.get("rating", 0))
    if not 1 <= rating_val <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    existing = db.query(Rating).filter(Rating.user_id == current_user.id, Rating.movie_id == movie_id).first()
    if existing:
        existing.rating = rating_val
    else:
        db.add(Rating(user_id=current_user.id, movie_id=movie_id, rating=rating_val))
    db.commit()
    return {"message": "Rating saved", "rating": rating_val}


@router.post("/{movie_id}/watchlist")
def toggle_watchlist(movie_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(Watchlist).filter(Watchlist.user_id == current_user.id, Watchlist.movie_id == movie_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"in_watchlist": False}
    db.add(Watchlist(user_id=current_user.id, movie_id=movie_id))
    db.commit()
    return {"in_watchlist": True}


@router.post("/{movie_id}/favorite")
def toggle_favorite(movie_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.movie_id == movie_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"in_favorites": False}
    db.add(Favorite(user_id=current_user.id, movie_id=movie_id))
    db.commit()
    return {"in_favorites": True}


@router.post("/{movie_id}/review")
def add_review(
    movie_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = body.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Review cannot be empty")

    sentiment = analyze_sentiment(content)
    review = Review(
        user_id=current_user.id,
        movie_id=movie_id,
        content=content,
        sentiment_score=sentiment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {
        "id": review.id,
        "content": review.content,
        "sentiment_score": review.sentiment_score,
        "created_at": str(review.created_at),
        "username": current_user.username,
    }


@router.get("/{movie_id}/reviews")
def get_reviews(movie_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review, User)
        .join(User, Review.user_id == User.id)
        .filter(Review.movie_id == movie_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "content": r.content,
            "sentiment_score": r.sentiment_score,
            "created_at": str(r.created_at),
            "username": u.username,
            "avatar_url": u.avatar_url,
        }
        for r, u in reviews
    ]
