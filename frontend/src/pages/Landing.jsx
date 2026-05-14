import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Film, Sparkles, Brain, TrendingUp, Star, ChevronRight, Play, Zap, Shield, Users } from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'Hybrid ML Engine', desc: 'TF-IDF + cosine similarity fused with SVD collaborative filtering for truly personal picks.', color: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/20', icon_color: 'text-orange-400' },
  { icon: Sparkles, title: 'AI Movie Assistant', desc: 'Describe any mood, vibe, or film and CineAI finds the perfect match in seconds.', color: 'from-purple-500/20 to-indigo-500/10', border: 'border-purple-500/20', icon_color: 'text-purple-400' },
  { icon: TrendingUp, title: 'Live Trends', desc: 'Real-time popularity rankings, top-rated charts, and genre-filtered discovery.', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', icon_color: 'text-blue-400' },
  { icon: Zap, title: 'Instant Personalization', desc: 'Rate a few films during onboarding and get a fully tailored feed immediately.', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', icon_color: 'text-emerald-400' },
]

const POSTERS = [
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsLeSh2LX9B1v.jpg',
  'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  'https://image.tmdb.org/t/p/w342/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
  'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  'https://image.tmdb.org/t/p/w342/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
  'https://image.tmdb.org/t/p/w342/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  'https://image.tmdb.org/t/p/w342/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg',
]

const STATS = [
  { value: '48+', label: 'Curated Films' },
  { value: '3', label: 'ML Algorithms' },
  { value: 'AI', label: 'Chat Assistant' },
  { value: '∞', label: 'Discoveries' },
]

function MarqueeRow({ items, reverse = false, speed = 35 }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex gap-3"
        style={{
          animation: `marquee ${speed}s linear infinite${reverse ? ' reverse' : ''}`,
          width: 'max-content',
        }}
      >
        {doubled.map((src, i) => (
          <div key={i} className="flex-shrink-0 w-28 h-40 rounded-xl overflow-hidden ring-1 ring-white/5 shadow-lg">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = 'none' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-[#080c14] overflow-x-hidden">

      {/* ─── NAV ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cinema-500 flex items-center justify-center glow-orange-sm">
              <Film className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Cine<span className="text-cinema-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">
              Get Started →
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">

        {/* Background orbs */}
        <div className="orb w-[700px] h-[700px] bg-cinema-500/[0.07] top-[-200px] left-[-200px]" />
        <div className="orb w-[500px] h-[500px] bg-purple-500/[0.06] bottom-0 right-[-100px]" />
        <div className="orb w-[300px] h-[300px] bg-blue-500/[0.05] top-1/3 right-1/4" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 glass border-cinema-500/20 text-cinema-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cinema-500 animate-pulse" />
            AI-Powered Movie Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Find films</span>
            <br />
            <span className="gradient-text text-glow">you'll love.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto mb-10"
          >
            CineAI learns your taste through machine learning and serves recommendations so precise they feel hand-picked.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link
              to="/register"
              className="group btn-primary text-base px-8 py-3.5 rounded-2xl flex items-center gap-2.5 glow-orange"
            >
              <Play className="w-5 h-5 fill-current" />
              Start for Free
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-3.5 rounded-2xl">
              I have an account
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center justify-center gap-8 sm:gap-12"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Marquee rows */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 w-full mt-16 space-y-3"
          style={{ maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)' }}
        >
          <MarqueeRow items={POSTERS} speed={40} />
          <MarqueeRow items={[...POSTERS].reverse()} reverse speed={50} />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cinema-500 text-sm font-semibold tracking-widest uppercase mb-3">Why CineAI</p>
          <h2 className="text-4xl font-black text-white leading-tight">
            Not just a watchlist app.<br />
            <span className="gradient-text-muted">A movie intelligence platform.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`relative rounded-2xl p-6 border border-glow bg-gradient-to-br ${f.color} ${f.border} overflow-hidden cursor-default`}
            >
              <div className="absolute inset-0 bg-[#080c14]/60 rounded-2xl" />
              <div className="relative z-10">
                <div className={`w-11 h-11 rounded-xl glass flex items-center justify-center mb-5 ${f.icon_color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl font-black text-white mb-3">Up and running in 60 seconds</h2>
          <p className="text-slate-500">No credit card. No setup. Just great movies.</p>
        </motion.div>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-10 left-[calc(16.67%)] right-[calc(16.67%)] h-px bg-gradient-to-r from-cinema-500/30 via-purple-500/30 to-cinema-500/30 hidden md:block" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create account', desc: 'Sign up in under 30 seconds — just email and password.', icon: Shield },
              { step: '02', title: 'Pick your genres', desc: 'Tell us what you love and we seed your recommendations instantly.', icon: Star },
              { step: '03', title: 'Discover & enjoy', desc: 'Get a personalized feed that gets smarter with every rating.', icon: Sparkles },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative w-20 h-20 rounded-2xl glass border-cinema-500/20 flex items-center justify-center mx-auto mb-5 border-glow">
                  <s.icon className="w-8 h-8 text-cinema-500" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cinema-500 text-white text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cinema-500/20 via-purple-500/10 to-transparent" />
          <div className="absolute inset-0 glass" />
          <div className="relative z-10 p-10 sm:p-14 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Stop scrolling. Start watching.
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join CineAI and let the algorithm do the work. Your next favorite film is one click away.
            </p>
            <Link to="/register" className="btn-primary text-base px-10 py-4 rounded-2xl inline-flex items-center gap-2.5 glow-orange">
              <Film className="w-5 h-5" />
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cinema-500 flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-400">CineAI</span>
          </div>
          <p className="text-xs text-slate-600">Built with machine learning + passion for cinema</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link to="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-400 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
