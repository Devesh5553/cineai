import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const passwordStrength = form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cinema-500 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Cine<span className="text-cinema-500">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1">Start discovering personalized movies</p>
        </div>

        <div className="card p-6 shadow-2xl">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input className="input" placeholder="cinelover" value={form.username} onChange={update('username')} required minLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="At least 6 characters"
                  value={form.password} onChange={update('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      passwordStrength === 'strong' ? 'w-full bg-green-500' : passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'
                    }`} />
                  </div>
                  <span className={`text-xs ${passwordStrength === 'strong' ? 'text-green-400' : passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cinema-500 hover:text-cinema-400 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
