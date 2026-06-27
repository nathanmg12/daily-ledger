'use client'

import { useState, useEffect } from 'react'
import ShareTemplate from '@/components/ShareTemplate'

export default function ShareTemplateWrapper() {
  const [card, setCard] = useState(null)
  const [style, setStyle] = useState('stack')

  useEffect(() => {
    function handleShare(e) {
      setCard(e.detail.card)
      setStyle(e.detail.style || 'stack')
    }
    window.addEventListener('tdl-share', handleShare)
    return () => window.removeEventListener('tdl-share', handleShare)
  }, [])

  return <ShareTemplate card={card} style={style} />
}