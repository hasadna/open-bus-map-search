import styled from 'styled-components'
import { NEUTRAL_COLOR } from 'src/pages/components/timeline/TimelinePoint'

type HorizontalLineProps = {
  /** The y of the instant itself — see `instantY`, not a dot's top edge. */
  top: number
  isTarget?: boolean
  color?: string
}

const StyledLine = styled.div<{ $top: number; $dashed?: boolean; $color: string }>`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $top }) => $top}px;
  height: 0;
  border-top: 1px ${({ $dashed }) => ($dashed ? 'dashed' : 'solid')} ${({ $color }) => $color};
  opacity: ${({ $dashed }) => ($dashed ? 0.55 : 0.75)};
  user-select: none;
  pointer-events: none;
`

export const HorizontalLine = ({ top, isTarget, color }: HorizontalLineProps) => (
  <StyledLine $top={top} $dashed={isTarget} $color={color ?? NEUTRAL_COLOR} />
)
