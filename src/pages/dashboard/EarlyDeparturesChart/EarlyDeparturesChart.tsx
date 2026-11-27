import { Alert, Link, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KAV_BOCHAN_BUS_PAGE_URL, originDeparturesQueryOptions } from 'src/api/kavBochanService'
import { type CivilDate, civilDateToDayjs } from 'src/model/time/civilDate'
import { InfoItem, InfoTable } from 'src/pages/components/InfoTable'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import { type EarlyDeparturesSummary, summarizeEarlyDepartures } from './summarizeEarlyDepartures'

const formatDay = (date: CivilDate, pattern = 'DD/MM/YY') => civilDateToDayjs(date).format(pattern)

interface EarlyDeparturesChartProps {
  startDate: CivilDate
  endDate: CivilDate
}

export default function EarlyDeparturesChart({ startDate, endDate }: EarlyDeparturesChartProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery(originDeparturesQueryOptions())
  const summary = useMemo(
    () => data && summarizeEarlyDepartures(data, startDate, endDate),
    [data, startDate, endDate],
  )

  return (
    <Widget title={t('early_departures_title')} marginBottom>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        {t('early_departures_description')}
      </Typography>
      {summary ? (
        <EarlyDeparturesSummaryView summary={summary} startDate={startDate} endDate={endDate} />
      ) : isLoading ? (
        <SkeletonLoader active />
      ) : (
        // Kept data outlives a failed refresh, so this shows only when nothing was ever loaded.
        <Alert severity="warning" variant="outlined">
          {t('early_departures_fetch_failed')}
        </Alert>
      )}
      <Typography variant="caption" component="p" sx={{ marginTop: 2 }}>
        <Trans i18nKey="early_departures_source">
          <Link href={KAV_BOCHAN_BUS_PAGE_URL} target="_blank" rel="noopener noreferrer" />
        </Trans>
      </Typography>
    </Widget>
  )
}

function EarlyDeparturesSummaryView({
  summary: { days, early, measured, available },
  startDate,
  endDate,
}: {
  summary: EarlyDeparturesSummary
  startDate: CivilDate
  endDate: CivilDate
}) {
  const { t } = useTranslation()

  if (!available) {
    return (
      <Alert severity="info" variant="outlined">
        {t('early_departures_none_published')}
      </Alert>
    )
  }

  const availableRange = {
    first: formatDay(available.first),
    last: formatDay(available.last),
    interpolation: { escapeValue: false },
  }

  if (days.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {t('early_departures_none_in_range', availableRange)}
      </Alert>
    )
  }

  return (
    <>
      <Typography variant="h6" component="p">
        {t('early_departures_summary', { early, measured, share: early / measured })}
      </Typography>
      {(startDate < available.first || endDate > available.last) && (
        <Typography variant="body2" color="text.secondary">
          {t('early_departures_partial_range', availableRange)}
        </Typography>
      )}
      <ResponsiveContainer debounce={1000} height={300}>
        <LineChart data={days} margin={{ top: 16, right: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(date: CivilDate) => formatDay(date, 'DD/MM')} />
          <YAxis unit="%" tick={{ direction: 'ltr' }} />
          <Tooltip
            content={({ payload }) => {
              const day = payload?.[0]?.payload as (typeof days)[number] | undefined
              return day ? (
                <Widget>
                  <InfoTable>
                    <InfoItem label={t('early_departures_date')} value={formatDay(day.date)} />
                    <InfoItem
                      label={t('early_departures_early')}
                      value={t('early_departures_count', { value: day.early })}
                    />
                    <InfoItem
                      label={t('early_departures_measured')}
                      value={t('early_departures_count', { value: day.measured })}
                    />
                    <InfoItem
                      label={t('early_departures_share')}
                      value={t('early_departures_percent', { share: day.early / day.measured })}
                    />
                  </InfoTable>
                </Widget>
              ) : null
            }}
          />
          <Line type="monotone" dataKey="earlyPercent" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
