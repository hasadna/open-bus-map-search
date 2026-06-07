import { Add, Remove } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

type TMapFooterButtons = {
  currentMarkerId: number
  markerIds: number[]
  navigateToMarker: (id: number) => void
}

function MapFooterButtons({
  currentMarkerId,
  markerIds,
  navigateToMarker: navigateMarkers,
}: TMapFooterButtons) {
  const { t, i18n } = useTranslation()
  const currentIndex = markerIds.indexOf(currentMarkerId)
  const nextStep = markerIds[currentIndex + 1]
  const prevStep = markerIds[currentIndex - 1]
  const nextEnable = nextStep !== undefined
  const prevEnable = prevStep !== undefined

  return (
    // dir follows the active language so the buttons sit on the reading-correct
    // sides (prev at the start, next at the end) in both LTR and RTL.
    <Box
      dir={i18n.dir()}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Tooltip title={t('map_footer_previous_stop')}>
        {/* span wrapper lets the Tooltip work while the button is disabled */}
        <span>
          <IconButton
            color="primary"
            size="small"
            aria-label={t('map_footer_previous_stop')}
            disabled={!prevEnable}
            onClick={() => navigateMarkers(prevStep)}>
            <Remove />
          </IconButton>
        </span>
      </Tooltip>
      <Typography variant="body2" color="text.secondary">
        {currentIndex + 1} / {markerIds.length}
      </Typography>
      <Tooltip title={t('map_footer_next_stop')}>
        <span>
          <IconButton
            color="primary"
            size="small"
            aria-label={t('map_footer_next_stop')}
            disabled={!nextEnable}
            onClick={() => navigateMarkers(nextStep)}>
            <Add />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export default MapFooterButtons
