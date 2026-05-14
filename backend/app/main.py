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
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
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
