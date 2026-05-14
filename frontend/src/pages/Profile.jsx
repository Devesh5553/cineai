import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit3, Save, X, Star, BookmarkPlus, Heart, Film } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import MovieCard from '../components/common/MovieCard'
import api from '../api/client'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentRatings, setRecentRatings] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users/me/stats').then(({ data }) => setStats(data))
    api.get('/users/me/ratings').then(({ data }) => setRecentRatings(data.slice(0, 6)))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/me/profile', form)
      updateUser(data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to update') }
    setSaving(false)
  }

  const genreData = stats ? Object.entries(stats.genre_distribution || {}).map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count).slice(0, 8) : []
  const ratingData = stats ? Object.entries(stats.rating_distribution || {}).map(([r, c]) => ({ rating: `${r}★`, count: c })) : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-cinema-500/20 border-2 border-cinema-500/30 flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <User className="w-10 h-10 text-cinema-400" />
              )}
            </div>
            {user?.is_admin && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-cinema-500 text-white text-[10px] font-bold rounded-full">ADMIN</span>
            )}
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input className="input text-lg font-bold" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="Username" />
                <textarea className="input resize-none" rows={2} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Bio..." />
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost text-sm flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                  <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                  {user?.bio && <p className="text-slate-300 text-sm mt-2">{user.bio}</p>}
                  {user?.genre_preferences?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {user.genre_preferences.map((g) => (
                        <span key={g} className="tag">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setEditing(true)} className="btn-ghost text-sm flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            {[
              { icon: Star, label: 'Rated', value: stats.total_ratings },
              { icon: Film, label: 'Avg Rating', value: `${stats.avg_rating}/5` },
              { icon: BookmarkPlus, label: 'Watchlist', value: stats.watchlist_count },
              { icon: Heart, label: 'Favorites', value: stats.favorites_count },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-cinema-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Charts */}
      {stats && (genreData.length > 0 || ratingData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Genre Distribution */}
          {genreData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Genre Taste</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={genreData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="genre" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="Movies" dataKey="count" stroke="#f97316" fill="#f97316" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Rating Distribution */}
          {ratingData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingData}>
                  <XAxis dataKey="rating" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ratingData.map((_, i) => <Cell key={i} fill={`hsl(${220 + i * 15}, 70%, ${50 + i * 5}%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Ratings */}
      {recentRatings.length > 0 && (
        <section>
          <h2 className="section-title"><Star className="w-6 h-6 text-cinema-500" /> Recently Rated</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentRatings.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
          </div>
        </section>
      )}
    </div>
  )
}
