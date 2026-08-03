'use client'

import { useEffect, useState } from 'react'

// A thin rule under the nav that fills as the reader moves through the ledger.
// It exists to make the finiteness legible: the ledger ends, and you can see
// the end coming. Renders nothing when everything already fits on screen,
// since a progress bar that is always full says nothing.
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    let frame = null

    const measure = () => {
      frame = null
      const max = document.documentElement.scrollHeight - window.innerHeight

      if (max <= 40) {
        setScrollable(false)
        return
      }

      setScrollable(true)
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)))
    }

    const schedule = () => {
      // Coalesce to one measurement per frame. Reading scrollHeight forces
      // layout, so doing it per scroll event would be needless jank.
      if (frame === null) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // The install and notification prompts mount and unmount after load, which
    // changes the page height. Without this the rail would be calibrated to a
    // height that no longer exists.
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  if (!scrollable) return null

  return (
    <div className="tdl-progress" aria-hidden="true">
      <div
        className="tdl-progress-fill"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
