import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Star, Clock, Search, SlidersHorizontal, ChevronRight, Play, Plus, Info } from 'lucide-react'
import MovieCard from '../components/common/MovieCard'
import { SkeletonRow } from '../components/common/SkeletonCard'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useDebounce } from '../hooks/useDebounce'
import api from '../api/client'

const GENRES = ['All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller']
const SORTS = [
  { value: 'popularity', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'year', label: 'Newest' },
  { value: 'title', label: 'A–Z' },
]

function HeroMovie({ movie }) {
  if (!movie) return null
  return (
    <div className="relative -mx-4 sm:-mx-6 mb-10 overflow-hidden" style={{ height: '480px' }}>
      {/* Backdrop */}
      <img
        src={movie.backdrop_url || movie.poster_url}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.target.style.opacity = 0 }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-[#080c14]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-[#080c14]/30" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-cinema-500 uppercase tracking-widest">Featured</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
              <Star className="w-3 h-3 fill-yellow-400" />{movie.rating?.toFixed(1)}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">{movie.release_year}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">{movie.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-6 max-w-sm">{movie.overview}</p>
          <div className="flex gap-3">
            <Link to={`/movie/${movie.id}`} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl">
              <Play className="w-4 h-4 fill-current" /> View Details
            </Link>
            <button onClick={() => api.post(`/movies/${movie.id}/watchlist`)} className="btn-ghost flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl">
              <Plus className="w-4 h-4" /> Watchlist
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function HScrollSection({ title, icon: Icon, movies, emptyMsg }) {
  if (!movies?.length) return null
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <Icon className="w-5 h-5 text-cinema-500" />
          {title}
        </h2>
        <span className="text-xs text-slate-500">{movies.length} titles</span>
      </div>
      <div className="scroll-row">
        {movies.map((m, i) => (
          <div key={m.id} className="flex-shrink-0 w-36 sm:w-40">
            <MovieCard movie={m} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [searchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [trending, setTrending] = useState([])
  const [topRated, setTopRated] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('popularity')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounce(search, 400)

  const isFiltering = debouncedSearch || genre !== 'All'

  const fetchMovies = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true)
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 24, sort })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (genre !== 'All') params.set('genre', genre)
      const { data } = await api.get(`/movies?${params}`)
      setMovies((prev) => pageNum === 1 || reset ? data.movies : [...prev, ...data.movies])
      setHasMore(pageNum < data.pages)
      setPage(pageNum)
    } catch {}
    setLoading(false)
  }, [debouncedSearch, genre, sort])

  useEffect(() => { fetchMovies(1, true) }, [debouncedSearch, genre, sort])

  useEffect(() => {
    api.get('/movies/trending').then(({ data }) => {
      setTrending(data)
      if (data.length > 0) setFeaturedMovie(data[Math.floor(Math.random() * Math.min(data.length, 5))])
    })
    api.get('/movies/top-rated').then(({ data }) => setTopRated(data))
    api.get('/users/me/recently-viewed').then(({ data }) => setRecentlyViewed(data)).catch(() => {})
  }, [])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchMovies(page + 1)
  }, [hasMore, loading, page, fetchMovies])

  const sentinelRef = useInfiniteScroll(loadMore)

  return (
    <div className="pt-16">
      {/* Hero (only when not searching/filtering) */}
      <AnimatePresence>
        {!isFiltering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 sm:px-6"
          >
            {featuredMovie && <HeroMovie movie={featuredMovie} />}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">

        {/* Horizontal scroll rows (when not searching) */}
        {!isFiltering && (
          <>
            <HScrollSection title="Trending Now" icon={TrendingUp} movies={trending} />
            <HScrollSection title="Top Rated" icon={Star} movies={topRated} />
            {recentlyViewed.length > 0 && (
              <HScrollSection title="Continue Watching" icon={Clock} movies={recentlyViewed} />
            )}
          </>
        )}

        {/* ── Search + Filter bar ── */}
        <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-[#080c14]/95 backdrop-blur-xl border-b border-slate-800/60 mb-8">
          <div className="max-w-7xl mx-auto flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="input pl-10 py-2.5 text-sm"
                placeholder="Search movies, directors, cast..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-lg leading-none">×</button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-cinema-500 border-cinema-500 text-white' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Filter row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="max-w-7xl mx-auto pt-3 flex flex-col sm:flex-row gap-3">
                  {/* Genre pills */}
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`flex-shrink-0 genre-pill text-xs px-3 py-1.5 border ${
                          genre === g
                            ? 'bg-cinema-500 border-cinema-500 text-white shadow-lg shadow-cinema-500/25'
                            : 'border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {/* Sort */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {SORTS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSort(s.value)}
                        className={`genre-pill text-xs px-3 py-1.5 border whitespace-nowrap ${
                          sort === s.value
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'border-slate-700/60 text-slate-500 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main grid ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">
              {isFiltering
                ? debouncedSearch
                  ? <><Search className="w-5 h-5 text-cinema-500" />"{debouncedSearch}"</>
                  : <><Star className="w-5 h-5 text-cinema-500" />{genre}</>
                : <><Star className="w-5 h-5 text-cinema-500" />All Movies</>
              }
            </h2>
            {movies.length > 0 && (
              <span className="text-xs text-slate-500">{movies.length} shown</span>
            )}
          </div>

          {loading && movies.length === 0 ? (
            <SkeletonRow count={12} />
          ) : movies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-lg font-semibold text-white mb-2">No movies found</p>
              <p className="text-sm text-slate-500">Try different keywords or clear the filters</p>
              <button onClick={() => { setSearch(''); setGenre('All') }} className="btn-ghost text-sm mt-5 mx-auto">
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i % 24} />)}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-10">
              {loading && (
                <motion.div
                  className="w-7 h-7 border-2 border-slate-700 border-t-cinema-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
