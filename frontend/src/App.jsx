import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import ChatBot from './components/ChatBot'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Watchlist from './pages/Watchlist'
import Admin from './pages/Admin'

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <ChatBot />
    </>
  )
}

export default function App() {
  const { init } = useThemeStore()
  const { isAuthenticated, _hydrated } = useAuthStore()

  useEffect(() => { init() }, [])

  if (!_hydrated) return null

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} />

      {/* Protected routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <AppLayout><Home /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/movie/:id" element={
        <ProtectedRoute>
          <AppLayout><MovieDetail /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute>
          <AppLayout><Recommendations /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/watchlist" element={
        <ProtectedRoute>
          <AppLayout><Watchlist /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AppLayout><Admin /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
