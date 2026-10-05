"use client"

import * as React from "react"

export function ScaledDocumentPreview({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  const [contentHeight, setContentHeight] = React.useState<number>()

  React.useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function recompute() {
      if (!container || !content) return
      const naturalWidth = content.scrollWidth
      const naturalHeight = content.scrollHeight
      const nextScale = naturalWidth > container.clientWidth ? container.clientWidth / naturalWidth : 1
      setScale(nextScale)
      setContentHeight(naturalHeight * nextScale)
    }

    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(container)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <div style={{ height: contentHeight }}>
        <div ref={contentRef} className="w-fit" style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
