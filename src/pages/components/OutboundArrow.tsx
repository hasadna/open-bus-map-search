import { NorthEast, NorthWest } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

/**
 * Decorative hint that the text it trails is a link off this page. It points away from the
 * reader, so it mirrors: north-east in Hebrew or Arabic would aim back over that text.
 */
export const OutboundArrow = () => {
  const { i18n } = useTranslation()
  const Arrow = i18n.dir() === 'rtl' ? NorthWest : NorthEast
  return <Arrow aria-hidden sx={{ fontSize: '1em' }} />
}
