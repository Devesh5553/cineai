import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(callback, { threshold = 300 } = {}) {
  const observerRef = useRef(null)

  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) callback()
        },
        { rootMargin: `${threshold}px` }
      )
      if (node) observerRef.current.observe(node)
    },
    [callback, threshold]
  )

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return sentinelRef
}
