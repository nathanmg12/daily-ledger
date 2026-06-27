'use client'

import { useState, useEffect } from 'react'
import ShareTemplate from '@/components/ShareTemplate'

export default function ShareTemplateWrapper() {
  const [card, setCard] = useState(null)

  useEffect(() => {
    function handleShare(e) {
      setCard(e.detail)
    }
    window.addEventListener('tdl-share', handleShare)
    return () => window.removeEventListener('tdl-share', handleShare)
  }, [])

  return <ShareTemplate card={card} />
}