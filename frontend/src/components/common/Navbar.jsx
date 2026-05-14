import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Search, User, LogOut, Heart, BookmarkPlus, LayoutDashboard, Moon, Sun, Sparkles, Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useDebounce } from '../../hooks/useDebounce'
import api from '../../api/client'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (debouncedSearch.length < 2) { setSearchResults([]); return }
    api.get(`/movies?search=${encodeURIComponent(debouncedSearch)}&limit=6`)
       .then(({ data }) => setSearchResults(data.movies || []))
       .catch(() => {})
  }, [debouncedSearch])

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) {
        setSearchResults([])
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [showSearch])

  const submitSearch = () => {
    if (!searchQuery.trim()) return
    navigate(`/home?search=${encodeURIComponent(searchQuery)}`)
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  const navLinks = [
    { to: '/home', label: 'Discover' },
    { to: '/recommendations', label: 'For You' },
    { to: '/watchlist', label: 'My List' },
  ]

  const isActive = (to) => location.pathname === to || (to !== '/home' && location.pathname.startsWith(to))

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#080c14]/95 backdrop-blur-xl border-b border-slate-800/60 shadow-xl shadow-black/30' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-7 h-7 rounded-lg bg-cinema-500 flex items-center justify-center transition-transform group-hover:scale-110 glow-orange-sm">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tight hidden sm:block text-white">
                Cine<span className="text-cinema-500">AI</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5 ml-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(l.to)
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive(l.to) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/8 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search trigger */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 card-elevated overflow-visible z-50"
                  >
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          ref={searchInputRef}
                          className="input pl-9 py-2 text-sm"
                          placeholder="Search movies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                        />
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border-t border-slate-800 py-1">
                        {searchResults.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => {
                              navigate(`/movie/${movie.id}`)
                              setSearchQuery(''); setSearchResults([]); setShowSearch(false)
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left group/item"
                          >
                            <img
                              src={movie.poster_url}
                              alt=""
                              className="w-8 h-12 object-cover rounded-md flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover/item:text-cinema-400 transition-colors">{movie.title}</p>
                              <p className="text-[11px] text-slate-500">{movie.release_year} · {(movie.genres || []).slice(0,2).join(', ')}</p>
                            </div>
                          </button>
                        ))}
                        {searchQuery.length >= 2 && (
                          <button onClick={submitSearch} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-cinema-500 hover:bg-cinema-500/10 transition-colors border-t border-slate-800 mt-1 pt-2">
                            <Search className="w-3 h-3" />
                            See all results for "{searchQuery}"
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 rounded-xl hover:bg-white/5 transition-colors p-1"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-cinema-500/40" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cinema-500 to-orange-600 flex items-center justify-center text-xs font-black text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform hidden sm:block ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 card-elevated z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cinema-500 to-orange-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                          {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      {[
                        { icon: User, label: 'Profile', to: '/profile' },
                        { icon: Heart, label: 'Favorites', to: '/watchlist?tab=favorites' },
                        { icon: BookmarkPlus, label: 'Watchlist', to: '/watchlist' },
                        { icon: Sparkles, label: 'For You', to: '/recommendations' },
                        ...(user?.is_admin ? [{ icon: LayoutDashboard, label: 'Admin', to: '/admin' }] : []),
                      ].map(({ icon: Icon, label, to }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className="p-1.5 border-t border-slate-800">
                      <button
                        onClick={() => { logout(); navigate('/'); setShowDropdown(false) }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobile(!showMobile)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {showMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-800/60 bg-[#080c14]/98 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setShowMobile(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(l.to) ? 'text-white bg-white/8' : 'text-slate-400'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop for dropdowns */}
      {(showDropdown || showSearch) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowDropdown(false); setShowSearch(false) }} />
      )}
    </>
  )
}
