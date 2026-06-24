import { ExpandMore, HourglassBottom, Place, SquareFoot } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Link as MuiLink,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toIsraelTimezone } from 'src/dayjs'
import { PositionGroup } from 'src/pages/components/map-related/map-types'
import {
  distanceMeters,
  distinctPingCount,
  gapSeverity,
  medianPingInterval,
  PingGap,
  pingGaps,
} from 'src/pages/components/utils/gpsCoverage'

/** Height of the coverage strip, px. Pauses rise from the bottom as columns. */
const STRIP_HEIGHT = 48
/** Shortest column as a fraction of full height, so on-cadence pings stay visible. */
const MIN_BAR_FRACTION = 0.08

/**
 * Color stops the gap severity (0–1) is mapped onto: green on cadence → orange stretched
 * → red dropout. Columns interpolate between these so coverage reads as a smooth gradient
 * rather than three hard grades; the legend renders the same stops as a gradient bar.
 */
const GRADIENT_STOPS: { at: number; rgb: [number, number, number] }[] = [
  { at: 0, rgb: [34, 197, 94] }, // #22c55e green
  { at: 0.5, rgb: [245, 158, 11] }, // #f59e0b orange
  { at: 1, rgb: [239, 68, 68] }, // #ef4444 red
]

/** Interpolated color for a 0–1 severity, blending between {@link GRADIENT_STOPS}. */
const gapColor = (severity: number) => {
  const s = Math.min(1, Math.max(0, severity))
  let lo = GRADIENT_STOPS[0]
  let hi = GRADIENT_STOPS[GRADIENT_STOPS.length - 1]
  for (let i = 1; i < GRADIENT_STOPS.length; i++) {
    if (s <= GRADIENT_STOPS[i].at) {
      lo = GRADIENT_STOPS[i - 1]
      hi = GRADIENT_STOPS[i]
      break
    }
  }
  const f = (s - lo.at) / (hi.at - lo.at || 1)
  const ch = (a: number, b: number) => Math.round(a + (b - a) * f)
  return `rgb(${ch(lo.rgb[0], hi.rgb[0])}, ${ch(lo.rgb[1], hi.rgb[1])}, ${ch(lo.rgb[2], hi.rgb[2])})`
}

const fmtTime = (ms: number) => toIsraelTimezone(ms).format('HH:mm:ss')

/** Gap length as a zero-padded clock duration, e.g. 143s → "00:02:23". */
const fmtDuration = (ms: number) => {
  const totalSec = Math.round(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/**
 * Human-readable distance with a localized unit, e.g. "85 m" / "85 מטר", "1.4 km" / "1.4 קמ".
 * The unit word is translated so RTL locales read naturally rather than showing "km"/"m".
 */
const fmtDistance = (m: number, t: TFunction) => {
  if (m < 1000) return `${Math.round(m)} ${t('gps_coverage_unit_meter')}`
  return `${(m / 1000).toFixed(m < 10_000 ? 1 : 0)} ${t('gps_coverage_unit_km')}`
}

const tooltipRowStyle = { display: 'flex', alignItems: 'center', gap: 6 } as const

/**
 * Rich tooltip for a single gap: a time-difference row, a geo-difference row (how far the
 * bus moved while dark), and an action row whose geomarker focuses the map on the last-seen
 * position before the gap (the start ping). The MUI tooltip is interactive, so the button
 * is clickable on both desktop (hover→move in) and mobile (tap).
 */
const GapTooltip = ({
  gap,
  onFocusPing,
}: {
  gap: PingGap
  onFocusPing?: (loc: [number, number]) => void
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
      <span style={tooltipRowStyle}>
        <HourglassBottom fontSize="small" />
        {t('gps_coverage_tooltip_duration', {
          duration: fmtDuration(gap.gapMs),
        })}
      </span>
      <span style={tooltipRowStyle}>
        <SquareFoot fontSize="small" />
        {t('gps_coverage_tooltip_distance', {
          distance: fmtDistance(distanceMeters(gap.startLoc, gap.endLoc), t),
        })}
      </span>
      {onFocusPing && (
        <button
          type="button"
          onClick={() => onFocusPing(gap.startLoc)}
          style={{
            ...tooltipRowStyle,
            background: 'none',
            border: 'none',
            padding: 0,
            color: theme.palette.primary.main,
            font: 'inherit',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
          }}>
          <Place fontSize="small" />
          {t('gps_coverage_tooltip_focus_start')}
        </button>
      )}
    </div>
  )
}

interface GpsCoverageStripProps {
  positionGroups: PositionGroup[]
  /** Focus the map on a [lat, lon] ping — wired from the SingleLineMap page. */
  onFocusPing?: (loc: [number, number]) => void
  /**
   * Start with the disclosure open. Off in the app (it's an opt-in diagnostic view), but
   * stories set it so the strip is visible without driving a click through `play`.
   */
  defaultExpanded?: boolean
}

/**
 * Per-ride GPS coverage strip. Each ride is drawn as a horizontal timeline of the
 * *gaps between consecutive pings* — every segment's width is proportional to how long
 * that gap lasted, and its color reflects the gap relative to the ride's own median
 * cadence (green = on cadence, orange = stretched, red = the bus stopped reporting).
 * A long dropout therefore shows up as a single wide red band you can place in time.
 *
 * Consumes the pings the SingleLineMap page already fetched — it makes no API calls.
 */
export const GpsCoverageStrip = ({
  positionGroups,
  onFocusPing,
  defaultExpanded = false,
}: GpsCoverageStripProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  // Opaque tooltip that stays in the page's tonal family rather than inverting it.
  const tooltipBg =
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]
  const tooltipFg = theme.palette.text.primary
  // Which column is currently focused. Mouse hover drives this on desktop and touch
  // drives it on mobile, so the same key controls both the highlight and the tooltip.
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  // Render one row per selected vehicle. A vehicle whose ride reported too few pings to
  // plot a strip is shown with a notice (below) rather than dropped, so the list always
  // matches the "N vehicles" count; only when nothing is selected is the strip hidden.
  if (positionGroups.length === 0) return null

  return (
    // Collapsed by default: this is a diagnostic view most users won't need, so it lives
    // behind an "advanced data" disclosure below the map rather than always on screen.
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{
        my: 3,
        borderRadius: 3,
        overflow: 'hidden',
        '&::before': { display: 'none' }, // drop MUI's default top divider line
      }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          // Make the disclosure header read as a distinct, tappable bar rather than
          // plain text: tinted background, accent leading bar, and a bolder title.
          bgcolor: 'action.hover',
          borderInlineStart: `4px solid ${theme.palette.primary.main}`,
        }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('gps_coverage_title')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {t('gps_coverage_description')}
        </Typography>

        {positionGroups.map((group, idx) => {
          const gaps = pingGaps(group.positions)
          const median = medianPingInterval(group.positions)

          return (
            // One card per vehicle so the sections read as distinct blocks with clear
            // spacing between them rather than a single run of stacked strips.
            <Card key={group.vehicleRef ?? idx} variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {/* "Vehicle: <number>" — the number deep-links to the vehicle page. The link
                    is wrapped in <bdi> so the digits stay LTR inside an RTL (he/ar) header,
                    and uses reloadDocument because the vehicle page seeds its number from the
                    URL once on mount (InitialUrlParamsContext) — a plain SPA navigation would
                    not remount MainRoute and the page would open empty. */}
                {group.vehicleRef ? (
                  <>
                    {t('gps_coverage_vehicle_label')}{' '}
                    <bdi>
                      <MuiLink
                        component={Link}
                        to={`/vehicle?vehicleNumber=${group.vehicleRef}`}
                        reloadDocument
                        underline="hover">
                        {group.label ?? group.vehicleRef}
                      </MuiLink>
                    </bdi>
                  </>
                ) : (
                  (group.label ?? `#${idx + 1}`)
                )}
              </Typography>
              {gaps.length === 0 ? (
                // Fewer than two distinct-time pings means there is no gap to plot. Tell the
                // two cases apart — reported nothing vs. reported a single time (e.g. all of
                // a vehicle's pings share one recorded_at_time) — instead of dropping it.
                <Typography variant="body2" sx={{ color: 'warning.main' }}>
                  {t(
                    distinctPingCount(group.positions) === 0
                      ? 'gps_coverage_no_pings'
                      : 'gps_coverage_one_ping',
                  )}
                </Typography>
              ) : (
                <>
                  <div
                    style={{
                      // The time axis stays left→right in every locale (earliest gap on the
                      // left), per Material Design's "timelines are not mirrored" exception —
                      // so direction is pinned to ltr even when the page is rtl (he/ar).
                      direction: 'ltr',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                      height: STRIP_HEIGHT,
                      width: '100%',
                    }}>
                    {gaps.map((gap) => {
                      // Height is driven by the same gapSeverity the color uses, lifted onto a
                      // MIN_BAR_FRACTION floor so on-cadence gaps stay a visible baseline. Both
                      // channels are now one signal: tall ⇔ red, each reaching full at the
                      // GAP_FACTOR× dropout threshold, while absolute duration is carried by width.
                      const heightFraction =
                        MIN_BAR_FRACTION + (1 - MIN_BAR_FRACTION) * gapSeverity(gap.gapMs, median)
                      const key = String(gap.startMs)
                      const isHovered = hoveredKey === key
                      return (
                        <Tooltip
                          key={gap.startMs}
                          arrow
                          // Interactive (default) tooltip so the geomarker inside is clickable;
                          // onOpen/onClose sync the column highlight for both hover and touch.
                          enterDelay={0}
                          enterTouchDelay={0}
                          leaveTouchDelay={60_000}
                          onOpen={() => setHoveredKey(key)}
                          onClose={() => setHoveredKey((k) => (k === key ? null : k))}
                          slotProps={{
                            tooltip: {
                              sx: {
                                maxWidth: 'none',
                                backgroundColor: tooltipBg,
                                color: tooltipFg,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3],
                              },
                            },
                            arrow: { sx: { color: tooltipBg } },
                          }}
                          title={<GapTooltip gap={gap} onFocusPing={onFocusPing} />}>
                          <div
                            style={{
                              flexGrow: gap.gapMs,
                              flexBasis: 0,
                              minWidth: 0,
                              height: `${heightFraction * 100}%`,
                              // Soften just the top corners so columns read as rounded bars
                              // rising from a flat baseline.
                              borderRadius: '3px 3px 0 0',
                              background: gapColor(gapSeverity(gap.gapMs, median)),
                              // Blue border as an inset ring (not outline) so it stays inside the
                              // column and isn't painted over by the next; thicker/lighter on hover.
                              position: 'relative',
                              zIndex: isHovered ? 2 : undefined,
                              boxShadow: isHovered
                                ? `inset 0 0 0 2px ${theme.palette.primary.light}`
                                : `inset 0 0 0 1px ${theme.palette.primary.main}`,
                              cursor: 'pointer',
                            }}
                          />
                        </Tooltip>
                      )
                    })}
                  </div>
                  <div
                    style={{
                      // Match the strip: start label on the left, end on the right, in every locale.
                      direction: 'ltr',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: 'gray',
                      marginTop: 2,
                    }}>
                    <span>{fmtTime(gaps[0].startMs)}</span>
                    <span>{fmtTime(gaps[gaps.length - 1].endMs)}</span>
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </AccordionDetails>
    </Accordion>
  )
}
