import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.onboarding_complete ? '/home' : '/onboarding')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-cinema-500/[0.06] -top-60 -left-60" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/[0.05] -bottom-40 -right-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cinema-500 flex items-center justify-center glow-orange">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Cine<span className="text-cinema-500">AI</span>
            </span>
          </Link>
          <p className="text-slate-500 text-sm mt-3">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card-elevated p-7">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2.5 text-sm rounded-xl"
            >
              {loading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Demo accounts</p>
            <div className="space-y-1">
              {[
                { label: 'Demo User', email: 'demo@cineai.com', pass: 'demo123' },
                { label: 'Admin', email: 'admin@cineai.com', pass: 'admin123' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass) }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs text-slate-400 hover:text-white"
                >
                  <span className="font-medium text-slate-300">{acc.label}</span>
                  <span className="text-slate-600"> · {acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          New here?{' '}
          <Link to="/register" className="text-cinema-500 hover:text-cinema-400 font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
