import { styled } from '@mui/material/styles'
import { NEUTRAL_COLOR } from 'src/pages/components/timeline/TimelinePoint'

type HorizontalLineProps = {
  /** The y of the instant itself — see `instantY`, not a dot's top edge. */
  top: number
  isTarget?: boolean
  color?: string
}

const StyledLine = styled('div')<{ $top: number; $dashed?: boolean; $color: string }>(
  ({ $top, $dashed, $color }) => ({
    position: 'absolute',
    left: 0,
    width: '100%',
    top: `${$top}px`,
    height: 0,
    borderTop: `1px ${$dashed ? 'dashed' : 'solid'} ${$color}`,
    opacity: $dashed ? 0.55 : 0.75,
    userSelect: 'none',
    pointerEvents: 'none',
  }),
)

export const HorizontalLine = ({ top, isTarget, color }: HorizontalLineProps) => (
  <StyledLine $top={top} $dashed={isTarget} $color={color ?? NEUTRAL_COLOR} />
)
