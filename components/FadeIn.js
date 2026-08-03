'use client'

import { useEffect, useRef, useState } from 'react'

// Reveals its children once they scroll into view.
//
// Do not nest these. A FadeIn inside another FadeIn fires its observer while
// the outer wrapper is still at opacity 0 — intersection ignores opacity — so
// the inner stagger is spent before anything is visible, and the two
// translateY offsets compound through nested transform contexts. Sections put
// a FadeIn on the header and one on each card instead of wrapping the block.
//
// Visibility lives in React state rather than direct style mutation so a
// re-render can't reset an element that has already been revealed and
// unobserved, which would strand it at opacity 0 permanently.
export default function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return

    const reveal = () => setVisible(true)

    // Reduced motion, or a browser without the observer: show it now.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      reveal()
      return
    }

    // Already on screen at mount — above the fold, or a restored scroll
    // position after back/forward. Reveal straight away rather than waiting on
    // the observer's first callback, which is what left cards blank when it
    // arrived late or not at all.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal()
      return
    }

    let observerResponded = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        observerResponded = true
        if (entry.isIntersecting) {
          reveal()
          observer.disconnect()
        }
      },
      // A negative bottom margin rather than a ratio threshold: a card taller
      // than the viewport can never satisfy a percentage cleanly, so this
      // triggers off the top edge and behaves the same at any card height.
      { rootMargin: '0px 0px -12% 0px' }
    )

    observer.observe(el)

    // An IntersectionObserver always delivers one callback per observed target
    // on setup, whether or not it intersects. Silence means the observer isn't
    // running, and this element would stay invisible forever — so reveal it.
    // Checking for that callback rather than blindly revealing on a timer
    // matters: a plain timeout would fire for anyone who reads the top of the
    // page for a few seconds, and every card below the fold would be revealed
    // before they ever scrolled to it.
    const failsafe = setTimeout(() => {
      if (!observerResponded) reveal()
    }, 1500)

    return () => {
      observer.disconnect()
      clearTimeout(failsafe)
    }
  }, [visible])

  return (
    <div
      ref={ref}
      className={visible ? 'tdl-reveal is-visible' : 'tdl-reveal'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
