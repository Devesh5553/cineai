from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), default="")
    bio = Column(Text, default="")
    is_admin = Column(Boolean, default=False)
    onboarding_complete = Column(Boolean, default=False)
    genre_preferences = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ratings = relationship("Rating", back_populates="user", cascade="all, delete")
    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete")
    reviews = relationship("Review", back_populates="user", cascade="all, delete")
    recently_viewed = relationship("RecentlyViewed", back_populates="user", cascade="all, delete")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=True)
    title = Column(String(255), nullable=False, index=True)
    overview = Column(Text, default="")
    poster_url = Column(String(500), default="")
    backdrop_url = Column(String(500), default="")
    genres = Column(JSON, default=list)
    cast = Column(JSON, default=list)
    director = Column(String(150), default="")
    release_year = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    runtime = Column(Integer, default=0)
    language = Column(String(10), default="en")
    keywords = Column(JSON, default=list)
    trailer_url = Column(String(500), default="")
    popularity = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ratings = relationship("Rating", back_populates="movie", cascade="all, delete")
    watchlist_entries = relationship("Watchlist", back_populates="movie", cascade="all, delete")
    favorite_entries = relationship("Favorite", back_populates="movie", cascade="all, delete")
    reviews = relationship("Review", back_populates="movie", cascade="all, delete")
    recently_viewed_entries = relationship("RecentlyViewed", back_populates="movie", cascade="all, delete")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    rating = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="watchlist")
    movie = relationship("Movie", back_populates="watchlist_entries")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    movie = relationship("Movie", back_populates="favorite_entries")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    content = Column(Text, nullable=False)
    sentiment_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")


class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="recently_viewed")
    movie = relationship("Movie", back_populates="recently_viewed_entries")
