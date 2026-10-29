from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import engine, Base
from .routers import auth, movies, recommendations, users, chat
from .ml import content_recommender, collab_recommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    # Auto-seed if database is empty
    from .database import SessionLocal
    from .models.models import Movie
    db = SessionLocal()
    try:
        if db.query(Movie).count() == 0:
            logger.info("Database has 0 movies; auto-seeding initial data...")
            try:
                from data.seed import seed
                seed()
                logger.info("Initial database seeding completed!")
            except Exception as se:
                logger.error(f"Auto-seed failed: {se}")
    except Exception as e:
        logger.error(f"Error checking movie count: {e}")
    finally:
        db.close()

    # Load ML models
    if content_recommender.load():
        logger.info("Content-based model loaded")
    else:
        logger.info("No saved content model; will train on first /train call")

    if collab_recommender.load():
        logger.info("Collaborative model loaded")

    yield
    logger.info("Shutting down")


app = FastAPI(
    title="CineAI Recommendation API",
    version="1.0.0",
    description="AI-powered movie recommendation system",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(recommendations.router)
app.include_router(users.router)
app.include_router(chat.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
