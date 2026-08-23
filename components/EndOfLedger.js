'use client'

import { useState } from 'react'
import domtoimage from 'dom-to-image-more'
import EditionTemplate, { EDITION_DIMENSIONS } from '@/components/EditionTemplate'

// The end of the ledger used to be a dead end: you finished reading and the
// page simply stopped. It is the one moment a reader has demonstrably finished
// and has attention to spare, so it carries both onward actions.
export default function EndOfLedger({ cards, edition, dateLabel, isArchive = false, archiveHref = '/ledger' }) {
  const [sharing, setSharing] = useState(false)

  async function shareEdition() {
    if (sharing) return
    setSharing(true)
    try {
      const node = document.getElementById('edition-template-root')
      if (!node) throw new Error('Edition template not found')

      node.style.visibility = 'visible'
      const blob = await domtoimage.toBlob(node, {
        width: EDITION_DIMENSIONS.width,
        height: EDITION_DIMENSIONS.height,
        style: { transform: 'none' },
        scale: 2,
        skipFonts: true,
        ignoreCSSRuleErrors: true,
        filter: (n) => !(n.tagName === 'LINK' && n.href?.includes('fonts.googleapis.com')),
      })
      node.style.visibility = 'hidden'

      const file = new File([blob], `tdl-edition-${edition || 'today'}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'The Daily Ledger' })
        } catch (err) {
          if (err.name !== 'AbortError') download(blob)
        }
      } else {
        download(blob)
      }
    } catch (err) {
      console.error('Edition share failed:', err)
    } finally {
      setSharing(false)
    }
  }

  function download(blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tdl-edition-${edition || 'today'}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tdl-end">
      <div className="tdl-end-rule">
        <span className="tdl-end-mark">◇</span>
      </div>

      <p className="tdl-end-title">
        {isArchive ? `That was No. ${String(edition ?? 1).padStart(3, '0')}.` : 'That’s today’s ledger.'}
      </p>
      <p className="tdl-end-note">
        {isArchive ? dateLabel : 'New cards tomorrow morning'}
      </p>

      <div className="tdl-end-actions">
        <button className="tdl-end-btn primary" onClick={shareEdition} disabled={sharing}>
          {sharing ? 'Preparing…' : 'Share this edition'}
        </button>
        <a className="tdl-end-btn ghost" href={archiveHref}>View past ledgers</a>
      </div>

      {/* Rendered offscreen so the capture has something to read. Only one
          edition exists per page, so it needs no dispatch indirection. */}
      <EditionTemplate cards={cards} edition={edition} dateLabel={dateLabel} />
    </div>
  )
}
