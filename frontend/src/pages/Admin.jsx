import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Film, Star, Cpu, BarChart2, RefreshCw, Play } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'
import api from '../api/client'

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6']

export default function Admin() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [training, setTraining] = useState(false)

  if (!user?.is_admin) return <Navigate to="/home" replace />

  useEffect(() => {
    api.get('/users/admin/stats').then(({ data }) => setStats(data))
    api.get('/recommendations/metrics').then(({ data }) => setMetrics(data)).catch(() => {})
  }, [])

  const trainModels = async () => {
    setTraining(true)
    try {
      await api.post('/recommendations/train')
      toast.success('Model training started in background!')
      setTimeout(() => {
        api.get('/recommendations/metrics').then(({ data }) => setMetrics(data)).catch(() => {})
        setTraining(false)
      }, 5000)
    } catch { toast.error('Training failed'); setTraining(false) }
  }

  const statCards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.total_users, color: 'text-blue-400' },
    { icon: Film, label: 'Movies', value: stats.total_movies, color: 'text-cinema-500' },
    { icon: Star, label: 'Ratings', value: stats.total_ratings, color: 'text-yellow-400' },
    { icon: BarChart2, label: 'Reviews', value: stats.total_reviews, color: 'text-purple-400' },
  ] : []

  const genreData = [
    { name: 'Action', value: 12 }, { name: 'Drama', value: 18 }, { name: 'Sci-Fi', value: 9 },
    { name: 'Thriller', value: 8 }, { name: 'Crime', value: 7 }, { name: 'Comedy', value: 5 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cinema-500/20 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-cinema-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">System analytics & model management</p>
          </div>
        </div>
        <button onClick={trainModels} disabled={training} className="btn-primary flex items-center gap-2 text-sm">
          {training ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {training ? 'Training...' : 'Train Models'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <Icon className={`w-8 h-8 ${color} mb-3`} />
            <p className="text-3xl font-bold text-white">{value?.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ML Metrics */}
      {metrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-cinema-500" />
            <h2 className="text-lg font-semibold text-white">ML Model Performance</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Collaborative RMSE</p>
              <p className="text-2xl font-bold text-white">{metrics.collaborative?.rmse?.toFixed(3) || 'N/A'}</p>
              <p className="text-xs text-slate-500 mt-1">Lower is better (SVD)</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Total Ratings</p>
              <p className="text-2xl font-bold text-white">{metrics.total_ratings}</p>
              <p className="text-xs text-slate-500 mt-1">Training data points</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Engine Type</p>
              <p className="text-xl font-bold text-cinema-400">Hybrid</p>
              <p className="text-xs text-slate-500 mt-1">Content + Collaborative</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Genre Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={genreData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Movie Genre Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
