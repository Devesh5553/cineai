# CineAI — AI-Powered Movie Recommendation System

A full-stack movie recommendation web app with a hybrid ML engine, AI chatbot, and a modern cinematic UI.

---

## Features

- **Hybrid Recommendations** — Combines content-based filtering (TF-IDF + cosine similarity) with collaborative filtering for personalised picks
- **AI Chatbot** — Powered by Claude (Anthropic), recommends movies based on mood, genre, and your watch history
- **98 Movies** — Seeded with detailed metadata including genres, cast, director, keywords, ratings, and posters from TMDB
- **User Ratings & Reviews** — Rate movies and write reviews with automatic sentiment analysis
- **Watchlist & Favourites** — Save movies to watch later or mark favourites
- **Onboarding Flow** — Genre preference selection on first login to cold-start recommendations
- **Trending & Top Rated** — Dynamic sections based on popularity and rating scores
- **Infinite Scroll** — Seamless browsing through the full catalogue
- **Debounced Search** — Real-time movie search with instant results
- **Admin Dashboard** — View user stats, movie counts, and system metrics
- **Dark / Light Theme** — Persisted theme toggle
- **JWT Authentication** — Secure login with 7-day token expiry

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS v3 | Styling with custom cinema colour palette |
| Framer Motion | Animations and page transitions |
| Zustand | Global state (auth, theme) |
| React Router v6 | Client-side routing |
| Axios | HTTP client with auth interceptor |
| Recharts | Rating visualisation charts |
| Lucide React | Icon library |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | REST API framework |
| SQLAlchemy + SQLite | ORM and database |
| Pydantic v2 | Request/response validation |
| scikit-learn | TF-IDF vectoriser and cosine similarity |
| TextBlob | Sentiment analysis on reviews |
| Anthropic SDK | Claude AI chatbot |
| python-jose | JWT token generation |
| passlib + bcrypt | Password hashing |

---

## Project Structure

```
recommendation/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Settings (reads from .env)
│   │   ├── database.py          # SQLAlchemy engine and session
│   │   ├── models/
│   │   │   └── models.py        # User, Movie, Rating, Watchlist, etc.
│   │   ├── routers/
│   │   │   ├── auth.py          # /api/auth — register, login, me
│   │   │   ├── movies.py        # /api/movies — CRUD, search, filter
│   │   │   ├── recommendations.py # /api/recommendations — hybrid engine
│   │   │   ├── users.py         # /api/users — profile, watchlist, stats
│   │   │   └── chat.py          # /api/chat — AI chatbot
│   │   ├── ml/
│   │   │   ├── content_based.py # TF-IDF + cosine similarity
│   │   │   ├── collaborative.py # SVD collaborative filtering
│   │   │   ├── hybrid.py        # Weighted hybrid recommender
│   │   │   └── sentiment.py     # TextBlob sentiment analysis
│   │   └── utils/
│   │       └── helpers.py       # JWT, password hashing, auth deps
│   ├── data/
│   │   ├── seed.py              # Seeds movies and demo users
│   │   └── update_posters.py   # Fetches correct poster URLs from TMDB
│   ├── saved_models/            # Persisted ML model pickle files
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
└── frontend/
    ├── src/
    │   ├── pages/               # Landing, Login, Home, MovieDetail, etc.
    │   ├── components/          # Navbar, MovieCard, ChatBot, Skeletons
    │   ├── store/               # Zustand auth and theme stores
    │   ├── hooks/               # useDebounce, useInfiniteScroll
    │   └── api/client.js        # Axios instance with auth interceptor
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cineai.git
cd cineai
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file (or copy the example):

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./moviedb.sqlite
TMDB_API_KEY=your-tmdb-api-key        # optional — for poster updates
ANTHROPIC_API_KEY=your-anthropic-key  # optional — enables AI chatbot
CORS_ORIGINS=["http://localhost:5173"]
```

Seed the database:

```bash
python -m data.seed
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Demo User | demo@cineai.com | demo123 |
| Admin | admin@cineai.com | admin123 |

---

## API Overview

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/movies` | List movies (search, filter, sort, paginate) |
| GET | `/api/movies/trending` | Top movies by popularity |
| GET | `/api/movies/top-rated` | Top movies by rating |
| GET | `/api/movies/{id}` | Movie detail |
| POST | `/api/movies/{id}/rate` | Rate a movie |
| POST | `/api/movies/{id}/watchlist` | Toggle watchlist |
| POST | `/api/movies/{id}/favorite` | Toggle favourite |
| GET | `/api/recommendations/for-you` | Personalised hybrid picks |
| GET | `/api/recommendations/similar/{id}` | Content-based similar movies |
| POST | `/api/chat/message` | AI chatbot message |
| GET | `/api/users/me/watchlist` | User's watchlist |
| PUT | `/api/users/me/profile` | Update profile |
| GET | `/api/users/me/stats` | User stats |

---

## Optional: Fix Movie Posters

If any poster images are missing, run the TMDB poster updater (requires a free TMDB API key):

```bash
cd backend
python -m data.update_posters
```

---

## Environment Variables

| Variable | Required | Description |
|----------|---------|-------------|
| `SECRET_KEY` | Yes | JWT signing secret — use a long random string in production |
| `DATABASE_URL` | Yes | SQLAlchemy connection string |
| `CORS_ORIGINS` | Yes | JSON array of allowed frontend origins |
| `TMDB_API_KEY` | No | Enables poster URL updates |
| `ANTHROPIC_API_KEY` | No | Enables Claude AI chatbot (falls back to rule-based without it) |

---

## How the Recommendation Engine Works

1. **Content-based filtering** — A TF-IDF matrix is built from each movie's overview, genres, cast, director, and keywords. Cosine similarity scores find movies closest to what the user has rated highly.

2. **Collaborative filtering** — SVD factorisation on the user-rating matrix predicts scores for unseen movies based on users with similar taste.

3. **Hybrid blending** — Both scores are combined (weighted 40/60 by default). For new users with no ratings, the engine falls back to genre preferences set during onboarding.

4. **Sentiment-aware** — Review sentiment scores are computed with TextBlob and stored alongside each review.
