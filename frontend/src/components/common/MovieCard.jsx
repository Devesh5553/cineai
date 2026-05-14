import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Bookmark, Heart, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../api/client'

const GENRE_COLORS = {
  Action: 'bg-red-500/20 text-red-400 border-red-500/20',
  Adventure: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  Animation: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  Comedy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  Crime: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
  Drama: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  Fantasy: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  History: 'bg-stone-500/20 text-stone-400 border-stone-500/20',
  Horror: 'bg-red-800/20 text-red-500 border-red-800/20',
  Mystery: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  Romance: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
  'Science Fiction': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
  Thriller: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
  War: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20',
  Western: 'bg-orange-800/20 text-orange-400 border-orange-800/20',
}

function ratingColor(r) {
  if (r >= 8) return 'text-emerald-400'
  if (r >= 7) return 'text-yellow-400'
  if (r >= 6) return 'text-orange-400'
  return 'text-red-400'
}

export default function MovieCard({ movie, onUpdate, index = 0, showReason = false }) {
  const [inWatchlist, setInWatchlist] = useState(movie.in_watchlist)
  const [inFavorites, setInFavorites] = useState(movie.in_favorites)
  const [loading, setLoading] = useState(false)

  const toggleWatchlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const { data } = await api.post(`/movies/${movie.id}/watchlist`)
      setInWatchlist(data.in_watchlist)
      toast.success(data.in_watchlist ? 'Added to watchlist' : 'Removed from watchlist')
      onUpdate?.()
    } catch { toast.error('Failed') }
    setLoading(false)
  }

  const toggleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const { data } = await api.post(`/movies/${movie.id}/favorite`)
      setInFavorites(data.in_favorites)
      toast.success(data.in_favorites ? 'Added to favorites' : 'Removed from favorites')
      onUpdate?.()
    } catch { toast.error('Failed') }
    setLoading(false)
  }

  const genre = (movie.genres || [])[0]
  const genreClass = GENRE_COLORS[genre] || 'bg-slate-600/20 text-slate-400 border-slate-600/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.35, ease: 'easeOut' }}
      className="group relative border-glow rounded-xl"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="relative overflow-hidden rounded-xl card-hover cursor-pointer bg-[#0f1623]">

          {/* ── Poster ── */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster_url || ''}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&size=300&background=1e293b&color=475569&bold=true&length=1`
              }}
            />

            {/* Full overlay on hover */}
            <div className="absolute inset-0 poster-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1623] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* ── Rating badge (always visible) ── */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className={`text-[11px] font-bold ${ratingColor(movie.rating)}`}>
                {movie.rating?.toFixed(1)}
              </span>
            </div>

            {/* ── Action buttons (slide in on hover) ── */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
              <motion.button
                onClick={toggleFavorite}
                disabled={loading}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                  inFavorites
                    ? 'bg-red-500 border-red-400/50 text-white shadow-lg shadow-red-500/30'
                    : 'bg-black/60 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-red-500 hover:border-red-400/50 hover:text-white'
                } opacity-0 group-hover:opacity-100`}
                style={{ transitionDelay: '0ms' }}
              >
                <Heart className={`w-3.5 h-3.5 ${inFavorites ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                onClick={toggleWatchlist}
                disabled={loading}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                  inWatchlist
                    ? 'bg-cinema-500 border-cinema-400/50 text-white shadow-lg shadow-cinema-500/30'
                    : 'bg-black/60 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-cinema-500 hover:border-cinema-400/50 hover:text-white'
                } opacity-0 group-hover:opacity-100`}
                style={{ transitionDelay: '60ms' }}
              >
                <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* ── Year + Genre bar (always visible at bottom of poster) ── */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-center justify-between">
              {genre && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${genreClass}`}>
                  {genre}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium ml-auto">{movie.release_year}</span>
            </div>
          </div>

          {/* ── Card footer ── */}
          <div className="px-3 pt-2.5 pb-3 bg-[#0f1623]">
            <h3 className="font-semibold text-[13px] text-white leading-snug line-clamp-1 mb-0.5">
              {movie.title}
            </h3>

            {/* View details — slides up on hover */}
            <div className="overflow-hidden h-0 group-hover:h-6 transition-all duration-300">
              <div className="flex items-center gap-1 text-cinema-500 text-[11px] font-semibold pt-0.5">
                View details <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {showReason && movie.reason && (
              <p className="text-[11px] text-cinema-400/80 mt-1 line-clamp-1 italic">
                ✦ {movie.reason}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
