import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Stack, Typography } from '@mui/material'
import { useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { strideLiteOpsMetricsQueryOptions } from 'src/api/strideLite'
import { useFormats } from './formats'

const STRIDE_LITE_QUERIES = { queryKey: ['strideLite'] }

/** The backend caches the ops endpoints for 15 seconds, so a second click within that
 *  window answers with the same measurement, and the time shown says so. */
export const RefreshBar = () => {
  const { t } = useTranslation()
  const f = useFormats()
  const queryClient = useQueryClient()
  const fetching = useIsFetching(STRIDE_LITE_QUERIES) > 0
  const { data } = useQuery(strideLiteOpsMetricsQueryOptions())
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {data && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.measured_at', { time: f.time(data.measuredAt) })}
        </Typography>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<RefreshIcon />}
        loading={fetching}
        loadingPosition="start"
        onClick={() => void queryClient.refetchQueries(STRIDE_LITE_QUERIES)}>
        {t('strideLite.refresh')}
      </Button>
    </Stack>
  )
}
