import styled, { css } from 'styled-components'
import { useRef } from 'react'
import { useHover } from 'usehooks-ts'
import { NEUTRAL_COLOR } from 'src/pages/components/timeline/TimelinePoint'

type HorizontalLineProps = {
  top: number
}

const LineStyle = css<HorizontalLineProps>`
  position: absolute;
  width: 200%;
  user-select: none;
`

const StyledLine = styled.div<HorizontalLineProps & { visible: boolean }>`
  ${LineStyle};
  top: ${({ top }) => top + 3}px;
  height: 2px;
  background-color: ${NEUTRAL_COLOR};
  opacity: ${({ visible }) => (visible ? 0.4 : 0)};
`

const HoverTarget = styled.div<HorizontalLineProps>`
  ${LineStyle};
  top: ${({ top }) => top - 1}px;
  height: 12px;
  background-color: red;
  opacity: 0;
  z-index: 1;
`

export const HorizontalLine = ({ top }: HorizontalLineProps) => {
  const hoverRef = useRef<HTMLDivElement>(null)
  const isHovering = useHover(hoverRef)
  return (
    <>
      <StyledLine top={top} visible={isHovering} />
      <HoverTarget ref={hoverRef} top={top} />
    </>
  )
}
