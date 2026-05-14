import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Users, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import MovieCard from '../components/common/MovieCard'
import { SkeletonRow } from '../components/common/SkeletonCard'
import api from '../api/client'

export default function Recommendations() {
  const [forYou, setForYou] = useState([])
  const [trending, setTrending] = useState([])
  const [similarUsers, setSimilarUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = async () => {
    try {
      const [fyRes, trendRes, suRes] = await Promise.allSettled([
        api.get('/recommendations/for-you'),
        api.get('/recommendations/trending'),
        api.get('/recommendations/similar-users'),
      ])
      if (fyRes.status === 'fulfilled') setForYou(fyRes.value.data)
      if (trendRes.status === 'fulfilled') setTrending(trendRes.value.data.slice(0, 12))
      if (suRes.status === 'fulfilled') setSimilarUsers(suRes.value.data)
    } catch {}
  }

  useEffect(() => {
    setLoading(true)
    fetchAll().finally(() => setLoading(false))
  }, [])

  const refresh = async () => {
    setRefreshing(true)
    await fetchAll()
    setRefreshing(false)
    toast.success('Recommendations refreshed!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">For You</h1>
          <p className="text-slate-400">Personalized recommendations based on your taste</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Personalized */}
      <section className="mb-12">
        <h2 className="section-title"><Sparkles className="w-6 h-6 text-cinema-500" /> Recommended For You</h2>
        {loading ? (
          <SkeletonRow count={8} />
        ) : forYou.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Sparkles className="w-12 h-12 text-cinema-500 mx-auto mb-3 opacity-50" />
            <p className="text-white font-medium mb-1">No recommendations yet</p>
            <p className="text-sm text-slate-400">Rate a few movies to get personalized picks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {forYou.map((m, i) => (
              <div key={m.id}>
                <MovieCard movie={m} index={i} showReason />
                {m.confidence !== undefined && (
                  <div className="mt-1.5 px-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Match</span>
                      <span>{Math.round(m.confidence * 100)}%</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cinema-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.confidence * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.6 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="mb-12">
        <h2 className="section-title"><TrendingUp className="w-6 h-6 text-cinema-500" /> Trending Now</h2>
        {loading ? <SkeletonRow count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
          </div>
        )}
      </section>

      {/* Similar Users */}
      {similarUsers.length > 0 && (
        <section>
          <h2 className="section-title"><Users className="w-6 h-6 text-cinema-500" /> People With Similar Taste</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarUsers.map((u) => (
              <motion.div key={u.user_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cinema-500/20 border border-cinema-500/30 flex items-center justify-center text-lg font-bold text-cinema-400">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{u.username}</p>
                  <p className="text-xs text-slate-400">{u.common_movies} movies in common</p>
                </div>
                <div className="text-right">
                  <p className="text-cinema-500 font-bold">{Math.round(u.similarity * 100)}%</p>
                  <p className="text-xs text-slate-500">match</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
