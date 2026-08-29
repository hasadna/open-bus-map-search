import { Box } from '@mui/material'
import { type ReactNode } from 'react'
import { CARD_ROW_FONT_SIZE, CARD_ROW_HEIGHT } from 'src/pages/components/timeline/layout'

/**
 * Holds a card's rows in one two-column grid, so the labels share a column and the links
 * they introduce line up under each other rather than starting wherever their label ended.
 */
export const CARD_DETAILS_SX = {
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  justifyContent: 'start',
  alignItems: 'center',
  columnGap: 0.5,
  fontSize: CARD_ROW_FONT_SIZE,
  lineHeight: `${CARD_ROW_HEIGHT}px`,
  fontWeight: 'normal',
}

/**
 * One labelled row: what the ride offers, and the link that follows it.
 *
 * The two cells go straight into the grid above rather than into a wrapper of their own —
 * a row nested in its own box could not align its column with the row beside it. Both rows
 * a card can carry are built from this, though they are assembled in different files (the
 * map link in Timeline, the plate in RideVehicle).
 */
export const CardRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <Box component="span" sx={{ opacity: 0.75 }}>
      {label}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>{children}</Box>
  </>
)
