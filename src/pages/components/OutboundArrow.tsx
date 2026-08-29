import { NorthEast, NorthWest } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

/**
 * Decorative hint that the text it trails is a link off this page.
 *
 * It points forward and away from the reader, so which corner that is depends on the
 * writing direction: north-east in Hebrew or Arabic would aim back at the text it belongs
 * to. Hidden from assistive tech — the link's own name already says where it leads.
 */
export const OutboundArrow = () => {
  const { i18n } = useTranslation()
  const Arrow = i18n.dir() === 'rtl' ? NorthWest : NorthEast
  return <Arrow aria-hidden sx={{ fontSize: '1em' }} />
}
