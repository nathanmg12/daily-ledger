'use client'

import FadeIn from '@/components/FadeIn'
import SaveShareButtons from '@/components/SaveShareButtons'
import EndOfLedger from '@/components/EndOfLedger'
import { groupCardsByType } from '@/lib/ledger'

// The card rendering for a single ledger, shared by today and the archive.
// Extracted so an archived day is rendered by exactly the same code as today
// rather than a copy that drifts — the only differences are the wording of the
// end marker and, crucially, that the archive never marks cards seen.

