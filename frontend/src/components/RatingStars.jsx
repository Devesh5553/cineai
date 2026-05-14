import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../api/client'

export default function RatingStars({ movieId, initialRating = 0, onRate }) {
  const [hovered, setHovered] = useState(0)
  const [rated, setRated] = useState(initialRating)
  const [loading, setLoading] = useState(false)

  const handleRate = async (value) => {
    setLoading(true)
    try {
      await api.post(`/movies/${movieId}/rate`, { rating: value })
      setRated(value)
      toast.success(`Rated ${value}/5 stars!`)
      onRate?.(value)
    } catch { toast.error('Failed to rate') }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125 active:scale-110 disabled:opacity-50"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || rated)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            }`}
          />
        </button>
      ))}
      {rated > 0 && (
        <span className="text-sm text-slate-400 ml-2">Your rating: {rated}/5</span>
      )}
    </div>
  )
}
