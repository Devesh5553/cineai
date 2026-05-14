import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Clock, Calendar, Globe, BookmarkPlus, Heart, ExternalLink, ChevronLeft, MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import MovieCard from '../components/common/MovieCard'
import RatingStars from '../components/RatingStars'
import { SkeletonRow } from '../components/common/SkeletonCard'
import api from '../api/client'

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [similar, setSimilar] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/recommendations/similar/${id}`),
      api.get(`/movies/${id}/reviews`),
    ]).then(([movieRes, simRes, reviewRes]) => {
      setMovie(movieRes.data)
      setSimilar(simRes.data.slice(0, 8))
      setReviews(reviewRes.data)
    }).catch(() => toast.error('Failed to load movie'))
    .finally(() => setLoading(false))
  }, [id])

  const toggleWatchlist = async () => {
    const { data } = await api.post(`/movies/${id}/watchlist`)
    setMovie((m) => ({ ...m, in_watchlist: data.in_watchlist }))
    toast.success(data.in_watchlist ? 'Added to watchlist' : 'Removed from watchlist')
  }

  const toggleFavorite = async () => {
    const { data } = await api.post(`/movies/${id}/favorite`)
    setMovie((m) => ({ ...m, in_favorites: data.in_favorites }))
    toast.success(data.in_favorites ? 'Added to favorites' : 'Removed from favorites')
  }

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setSubmittingReview(true)
    try {
      const { data } = await api.post(`/movies/${id}/review`, { content: reviewText })
      setReviews((r) => [data, ...r])
      setReviewText('')
      toast.success('Review posted!')
    } catch { toast.error('Failed to post review') }
    setSubmittingReview(false)
  }

  const sentimentIcon = (score) => {
    if (score > 0.3) return <ThumbsUp className="w-3 h-3 text-green-400" />
    if (score < -0.3) return <ThumbsDown className="w-3 h-3 text-red-400" />
    return <Minus className="w-3 h-3 text-slate-400" />
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="skeleton h-96 rounded-2xl mb-8" />
      <SkeletonRow count={4} />
    </div>
  )

  if (!movie) return (
    <div className="flex items-center justify-center min-h-screen text-slate-400">Movie not found</div>
  )

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[55vh] overflow-hidden">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/1920x1080/0f172a/1e293b?text=' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 to-transparent" />

        {/* Back button */}
        <Link to="/home" className="absolute top-24 left-6 flex items-center gap-2 text-slate-300 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-48 h-72 md:w-56 md:h-84 object-cover rounded-2xl shadow-2xl ring-1 ring-white/10 mx-auto md:mx-0"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/224x336/1e293b/475569?text=No+Image' }}
            />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {(movie.genres || []).map((g) => (
                <span key={g} className="px-3 py-1 bg-cinema-500/20 border border-cinema-500/30 text-cinema-400 rounded-full text-sm">{g}</span>
              ))}
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> <span className="text-white font-bold">{movie.rating?.toFixed(1)}</span>/10</span>
              {movie.avg_user_rating && <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-cinema-400 fill-cinema-400" /> <span className="text-white font-bold">{movie.avg_user_rating}</span> user rating</span>}
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {movie.release_year}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {movie.runtime} min</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {movie.language?.toUpperCase()}</span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>

            {movie.director && (
              <p className="text-sm text-slate-400 mb-2"><span className="text-slate-300 font-medium">Director:</span> {movie.director}</p>
            )}
            {(movie.cast || []).length > 0 && (
              <p className="text-sm text-slate-400 mb-6"><span className="text-slate-300 font-medium">Cast:</span> {movie.cast.slice(0, 4).join(', ')}</p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={toggleWatchlist} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${movie.in_watchlist ? 'bg-cinema-500 text-white' : 'btn-ghost'}`}>
                <BookmarkPlus className="w-4 h-4" />
                {movie.in_watchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <button onClick={toggleFavorite} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${movie.in_favorites ? 'bg-red-500 text-white' : 'btn-ghost'}`}>
                <Heart className={`w-4 h-4 ${movie.in_favorites ? 'fill-current' : ''}`} />
                {movie.in_favorites ? 'Favorited' : 'Favorite'}
              </button>
            </div>

            {/* Rating */}
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Rate this movie</p>
              <RatingStars movieId={movie.id} initialRating={movie.user_rating || 0} onRate={(v) => setMovie((m) => ({ ...m, user_rating: v }))} />
            </div>
          </motion.div>
        </div>

        {/* Keywords */}
        {(movie.keywords || []).length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-3">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {movie.keywords.map((k) => <span key={k} className="tag">{k}</span>)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mb-10">
          <h2 className="section-title"><MessageSquare className="w-6 h-6 text-cinema-500" /> Reviews</h2>

          {/* Write review */}
          <div className="card p-4 mb-6">
            <textarea
              className="input resize-none mb-3"
              rows={3}
              placeholder="Share your thoughts about this movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button onClick={submitReview} disabled={submittingReview || !reviewText.trim()} className="btn-primary text-sm">
              {submittingReview ? 'Posting...' : 'Post Review'}
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-slate-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cinema-500/20 flex items-center justify-center text-xs font-bold text-cinema-400">
                        {r.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{r.username}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {sentimentIcon(r.sentiment_score)}
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{r.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <section>
            <h2 className="section-title"><Star className="w-6 h-6 text-cinema-500" /> Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
              {similar.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
