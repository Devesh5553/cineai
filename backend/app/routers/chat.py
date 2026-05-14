import random
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Movie, Rating, Watchlist
from ..utils.helpers import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = """You are CineAI, a knowledgeable and personable movie recommendation assistant.

Your job is to help users discover films they'll love based on their mood, taste, and what they've already seen.

Guidelines:
- Always recommend DIFFERENT movies than ones already mentioned in the conversation
- Personalize using the user's rated movies and genre preferences provided in context
- Explain briefly WHY each pick suits the user's request (tone, themes, vibe)
- Format every movie title as **Title (Year)**
- Keep responses focused — 3 to 5 recommendations unless asked for more
- Match the user's mood: if they want something light, don't recommend heavy dramas
- If the user mentions a movie they liked, find films with similar directors, themes, or tone
- Vary your suggestions — don't always pick the most popular option
"""


class ChatRequest(BaseModel):
    message: str
    history: list = []


def _build_user_context(user, db: Session) -> str:
    """Builds a personalization context string from the user's activity."""
    lines = []

    # Genre preferences
    if user.genre_preferences:
        lines.append(f"Preferred genres: {', '.join(user.genre_preferences)}")

    # Highly rated movies
    high_ratings = (
        db.query(Rating, Movie)
        .join(Movie, Rating.movie_id == Movie.id)
        .filter(Rating.user_id == user.id, Rating.rating >= 4)
        .order_by(Rating.rating.desc())
        .limit(8)
        .all()
    )
    if high_ratings:
        loved = ", ".join(f"{m.title} ({r.rating}/5)" for r, m in high_ratings)
        lines.append(f"Movies they loved: {loved}")

    # Low-rated movies (to avoid recommending similar)
    low_ratings = (
        db.query(Rating, Movie)
        .join(Movie, Rating.movie_id == Movie.id)
        .filter(Rating.user_id == user.id, Rating.rating <= 2)
        .limit(5)
        .all()
    )
    if low_ratings:
        disliked = ", ".join(m.title for _, m in low_ratings)
        lines.append(f"Movies they disliked: {disliked}")

    # Watchlist titles (already aware of these)
    watchlist = (
        db.query(Movie)
        .join(Watchlist, Watchlist.movie_id == Movie.id)
        .filter(Watchlist.user_id == user.id)
        .limit(6)
        .all()
    )
    if watchlist:
        lines.append(f"On their watchlist: {', '.join(m.title for m in watchlist)}")

    return "\n".join(lines) if lines else "New user — no history yet."


def _build_movie_catalog(db: Session) -> str:
    """Returns a compact but rich catalog of all movies for Claude."""
    movies = db.query(Movie).order_by(Movie.rating.desc()).all()
    entries = []
    for m in movies:
        genres = ", ".join((m.genres or [])[:3])
        director = f"dir. {m.director}" if m.director else ""
        entries.append(f"{m.title} ({m.release_year}) [{genres}] ⭐{m.rating} {director}")
    return "\n".join(entries)


def _already_recommended(history: list) -> set:
    """Extracts movie titles already mentioned in the conversation."""
    import re
    mentioned = set()
    for msg in history:
        if msg.get("role") == "assistant":
            # Match **Title (Year)** pattern
            for title in re.findall(r'\*\*(.+?)\s*\(\d{4}\)\*\*', msg.get("content", "")):
                mentioned.add(title.strip().lower())
    return mentioned


MOOD_KEYWORDS = {
    "happy":       ["Comedy", "Animation", "Family"],
    "feel good":   ["Comedy", "Drama", "Romance"],
    "sad":         ["Drama", "Romance"],
    "cry":         ["Drama", "Romance"],
    "scared":      ["Horror", "Thriller"],
    "scary":       ["Horror", "Thriller"],
    "tense":       ["Thriller", "Crime"],
    "excited":     ["Action", "Adventure"],
    "adventurous": ["Adventure", "Action", "Fantasy"],
    "mind":        ["Science Fiction", "Mystery", "Thriller"],
    "mind-bending":["Science Fiction", "Mystery", "Thriller"],
    "smart":       ["Drama", "Mystery", "Science Fiction"],
    "romantic":    ["Romance", "Drama"],
    "love":        ["Romance", "Drama"],
    "funny":       ["Comedy"],
    "laugh":       ["Comedy"],
    "fantasy":     ["Fantasy", "Adventure"],
    "animated":    ["Animation"],
    "anime":       ["Animation"],
    "classic":     [],   # handled separately
    "old":         [],
    "90s":         [],
    "80s":         [],
    "war":         ["War", "History"],
    "history":     ["History", "Drama"],
    "documentary": [],
    "western":     ["Western"],
    "mystery":     ["Mystery", "Crime", "Thriller"],
    "heist":       ["Crime", "Thriller", "Action"],
    "superhero":   ["Action", "Adventure", "Science Fiction"],
    "family":      ["Family", "Animation", "Comedy"],
}

GENRE_KEYWORDS = {
    "sci-fi":           ["Science Fiction"],
    "science fiction":  ["Science Fiction"],
    "horror":           ["Horror"],
    "comedy":           ["Comedy"],
    "action":           ["Action"],
    "thriller":         ["Thriller"],
    "romance":          ["Romance"],
    "drama":            ["Drama"],
    "animation":        ["Animation"],
    "crime":            ["Crime"],
    "mystery":          ["Mystery"],
    "adventure":        ["Adventure"],
    "fantasy":          ["Fantasy"],
    "history":          ["History"],
    "war":              ["War"],
    "western":          ["Western"],
    "music":            ["Music"],
}


def _fallback_response(message: str, movies: list, history: list) -> str:
    msg_lower = message.lower()
    already_seen = _already_recommended(history)

    # Collect target genres
    target_genres = []
    for kw, genres in {**GENRE_KEYWORDS, **MOOD_KEYWORDS}.items():
        if kw in msg_lower:
            target_genres.extend(genres)

    # Decade filter
    decade_filter = None
    if "80s" in msg_lower or "1980" in msg_lower:
        decade_filter = (1980, 1989)
    elif "90s" in msg_lower or "1990" in msg_lower:
        decade_filter = (1990, 1999)
    elif "2000s" in msg_lower:
        decade_filter = (2000, 2009)
    elif "classic" in msg_lower or "old" in msg_lower:
        decade_filter = (1900, 1990)

    # Filter pool
    pool = [m for m in movies if m.title.lower() not in already_seen]

    if decade_filter:
        pool = [m for m in pool if decade_filter[0] <= (m.release_year or 0) <= decade_filter[1]]

    if target_genres:
        genre_pool = [m for m in pool if any(g in (m.genres or []) for g in target_genres)]
        # Fall back to full pool if too few results
        pool = genre_pool if len(genre_pool) >= 3 else pool

    if not pool:
        return "I've already suggested everything I have for that! Try asking for a different genre or mood."

    # Weighted random: higher-rated movies more likely, but not always top 5
    pool_sorted = sorted(pool, key=lambda m: (m.rating or 0) + random.uniform(0, 2), reverse=True)
    picks = pool_sorted[:5]
    random.shuffle(picks)

    lines = []
    for m in picks:
        genres_str = ", ".join((m.genres or [])[:2])
        director_str = f" · {m.director}" if m.director else ""
        lines.append(f"- **{m.title} ({m.release_year})** — {genres_str}{director_str} | ⭐ {m.rating}/10")

    header = random.choice([
        "Here are some picks for you:",
        "You might enjoy these:",
        "Based on that, try these:",
        "These should hit the spot:",
    ])

    footer = random.choice([
        "Want more like any of these, or shall I try a different angle?",
        "Let me know if you'd like something more specific!",
        "Want details on any of these?",
    ])

    return f"{header}\n\n" + "\n".join(lines) + f"\n\n{footer}"


@router.post("/message")
async def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    all_movies = db.query(Movie).order_by(Movie.rating.desc()).all()

    if settings.ANTHROPIC_API_KEY and not settings.ANTHROPIC_API_KEY.startswith("your-"):
        try:
            import anthropic

            user_context = _build_user_context(current_user, db)
            movie_catalog = _build_movie_catalog(db)
            already_seen = _already_recommended(body.history)
            seen_note = (
                f"\nAlready recommended in this conversation (DO NOT suggest these again): {', '.join(already_seen)}"
                if already_seen else ""
            )

            system = (
                SYSTEM_PROMPT
                + f"\n\n--- USER PROFILE ---\n{user_context}"
                + f"\n\n--- AVAILABLE MOVIES (pick from these) ---\n{movie_catalog}"
                + seen_note
            )

            messages = []
            for msg in body.history[-8:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": body.message})

            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                system=system,
                messages=messages,
            )
            reply = response.content[0].text

        except Exception:
            reply = _fallback_response(body.message, all_movies, body.history)
    else:
        reply = _fallback_response(body.message, all_movies, body.history)

    return {"reply": reply, "role": "assistant"}
