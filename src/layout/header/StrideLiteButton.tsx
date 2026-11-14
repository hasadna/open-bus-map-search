import ScienceIcon from '@mui/icons-material/ScienceTwoTone'
import { useTranslation } from 'react-i18next'
import { isStrideLiteConfigured } from 'src/api/strideLite'
import { useStrideLiteOptIn } from 'src/hooks/useStrideLiteOptIn'

export const StrideLiteButton = () => {
  const { t } = useTranslation()
  const { optedIn, setOptedIn } = useStrideLiteOptIn()
  if (!isStrideLiteConfigured()) return null
  const label = optedIn ? t('strideLite.header_opt_out') : t('strideLite.header_opt_in')
  return (
    <button
      className="header-link"
      onClick={() => setOptedIn(!optedIn)}
      aria-label={label}
      aria-pressed={optedIn}
      title={label}>
      <ScienceIcon fontSize="inherit" color={optedIn ? 'primary' : 'inherit'} />
    </button>
  )
}
