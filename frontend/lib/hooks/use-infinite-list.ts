"use client"

import * as React from "react"

/** Reveals `items` in pages of `pageSize`, loading more as a sentinel element scrolls into view. */
export function useInfiniteList<T>(items: T[], pageSize = 5) {
  const [visibleCount, setVisibleCount] = React.useState(pageSize)
  const [loading, setLoading] = React.useState(false)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setVisibleCount(pageSize)
  }, [items, pageSize])

  const hasMore = visibleCount < items.length

  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoading(true)
          setTimeout(() => {
            setVisibleCount((c) => Math.min(items.length, c + pageSize))
            setLoading(false)
          }, 300)
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, items.length, pageSize])

  return { visibleItems: items.slice(0, visibleCount), hasMore, loading, sentinelRef }
}
