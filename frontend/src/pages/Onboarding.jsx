import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'

const ALL_GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuthStore()
  const navigate = useNavigate()

  const toggleGenre = (g) => {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  }

  const finish = async () => {
    setLoading(true)
    try {
      await api.post('/users/me/onboarding', { genre_preferences: selectedGenres, favorite_movie_ids: [] })
      updateUser({ onboarding_complete: true, genre_preferences: selectedGenres })
      navigate('/home')
    } catch { navigate('/home') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-cinema-500' : 'bg-slate-700'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-cinema-500/10 border border-cinema-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-cinema-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to CineAI!</h1>
                <p className="text-slate-400">Let's personalize your experience. First, pick your favorite genres.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {ALL_GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      selectedGenres.includes(g)
                        ? 'bg-cinema-500 border-cinema-500 text-white scale-105'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-slate-800/50'
                    }`}
                  >
                    {selectedGenres.includes(g) && <Check className="w-3 h-3 inline mr-1" />}
                    {g}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 mb-4">{selectedGenres.length} selected</p>
              <button
                onClick={() => setStep(2)}
                disabled={selectedGenres.length === 0}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">You're all set!</h1>
                <p className="text-slate-400 mb-4">You've selected <strong className="text-white">{selectedGenres.length} genres</strong>. CineAI will use this to build your personalized feed.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedGenres.map((g) => (
                    <span key={g} className="px-3 py-1 bg-cinema-500/20 border border-cinema-500/30 text-cinema-400 rounded-full text-sm">{g}</span>
                  ))}
                </div>
              </div>
              <button onClick={finish} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                ) : <>Start Exploring <Sparkles className="w-4 h-4" /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
