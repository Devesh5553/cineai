"""
Fetches correct poster/backdrop URLs from TMDB for every movie in the database.

Steps:
  1. Register free at https://www.themoviedb.org/signup
  2. Go to https://www.themoviedb.org/settings/api and copy your API key (v3 auth)
  3. Paste it into backend/.env  →  TMDB_API_KEY=<your_key>
  4. Run: python -m data.update_posters
"""
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from app.database import SessionLocal
from app.models.models import Movie
from app.config import settings

TMDB_MOVIE_URL = "https://api.themoviedb.org/3/movie/{tmdb_id}"
POSTER_BASE    = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE  = "https://image.tmdb.org/t/p/original"


def update_posters():
    api_key = settings.TMDB_API_KEY
    if not api_key or api_key.startswith("your-tmdb"):
        print("ERROR: TMDB_API_KEY is not set in backend/.env")
        print("       Get a free key at https://www.themoviedb.org/settings/api")
        sys.exit(1)

    db = SessionLocal()
    try:
        movies = db.query(Movie).order_by(Movie.id).all()
        print(f"Updating posters for {len(movies)} movies...\n")
        updated = 0
        failed  = 0

        for movie in movies:
            if not movie.tmdb_id:
                continue
            try:
                resp = requests.get(
                    TMDB_MOVIE_URL.format(tmdb_id=movie.tmdb_id),
                    params={"api_key": api_key},
                    timeout=10,
                )
                if resp.status_code != 200:
                    print(f"  SKIP  [{resp.status_code}] {movie.title}")
                    failed += 1
                    continue

                data = resp.json()
                new_poster   = f"{POSTER_BASE}{data['poster_path']}"   if data.get("poster_path")   else ""
                new_backdrop = f"{BACKDROP_BASE}{data['backdrop_path']}" if data.get("backdrop_path") else ""

                changed = False
                if new_poster and movie.poster_url != new_poster:
                    movie.poster_url = new_poster
                    changed = True
                if new_backdrop and movie.backdrop_url != new_backdrop:
                    movie.backdrop_url = new_backdrop
                    changed = True

                if changed:
                    updated += 1
                    print(f"  OK  {movie.title}")
                else:
                    print(f"  --  {movie.title} (no change)")

                time.sleep(0.1)   # stay well under TMDB rate limit (40 req/10s)

            except requests.RequestException as exc:
                print(f"  ERR {movie.title}: {exc}")
                failed += 1

        db.commit()
        print(f"\nDone — {updated} updated, {failed} failed/skipped out of {len(movies)} total.")

    finally:
        db.close()


if __name__ == "__main__":
    update_posters()
