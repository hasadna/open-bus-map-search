import { AddTwoTone, RemoveTwoTone } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

type TBusToolTipFooter = {
  currentMarkerId: number
  markerIds: number[]
  navigateToMarker: (id: number) => void
}

function BusToolTipFooter({
  currentMarkerId,
  markerIds,
  navigateToMarker: navigateMarkers,
}: TBusToolTipFooter) {
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
      <Tooltip title={t('bus_tooltip_footer_previous_location')}>
        {/* span wrapper lets the Tooltip work while the button is disabled */}
        <span>
          <IconButton
            color="primary"
            size="small"
            aria-label={t('bus_tooltip_footer_previous_location')}
            disabled={!prevEnable}
            onClick={() => navigateMarkers(prevStep)}>
            <RemoveTwoTone />
          </IconButton>
        </span>
      </Tooltip>
      {/* dir=ltr keeps the "3 / 5" counter reading left-to-right in RTL too */}
      <Typography variant="body2" color="text.secondary" dir="ltr">
        {currentIndex + 1} / {markerIds.length}
      </Typography>
      <Tooltip title={t('bus_tooltip_footer_next_location')}>
        <span>
          <IconButton
            color="primary"
            size="small"
            aria-label={t('bus_tooltip_footer_next_location')}
            disabled={!nextEnable}
            onClick={() => navigateMarkers(nextStep)}>
            <AddTwoTone />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export default BusToolTipFooter
