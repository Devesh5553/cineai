import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookmarkPlus, Heart } from 'lucide-react'
import MovieCard from '../components/common/MovieCard'
import { SkeletonRow } from '../components/common/SkeletonCard'
import api from '../api/client'

export default function Watchlist() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [watchlist, setWatchlist] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const tab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'watchlist'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wRes, fRes] = await Promise.all([
        api.get('/users/me/watchlist'),
        api.get('/users/me/favorites'),
      ])
      setWatchlist(wRes.data)
      setFavorites(fRes.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const movies = tab === 'favorites' ? favorites : watchlist

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <h1 className="text-3xl font-bold text-white mb-6">My Collection</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-8">
        {[
          { key: 'watchlist', icon: BookmarkPlus, label: 'Watchlist', count: watchlist.length },
          { key: 'favorites', icon: Heart, label: 'Favorites', count: favorites.length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setSearchParams(key === 'watchlist' ? {} : { tab: key })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-cinema-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20' : 'bg-slate-700'}`}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonRow count={6} />
      ) : movies.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          {tab === 'watchlist' ? <BookmarkPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" /> : <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />}
          <p className="text-white font-medium mb-1">Nothing here yet</p>
          <p className="text-sm text-slate-400">
            {tab === 'watchlist' ? 'Save movies to watch later' : 'Heart your favorite movies'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} onUpdate={fetchData} />)}
        </div>
      )}
    </div>
  )
}
