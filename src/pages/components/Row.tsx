import styled from 'styled-components'
import { MARGIN_MEDIUM } from 'src/resources/sizes'

export const Row = styled.div`
  width: 40%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  gap: ${MARGIN_MEDIUM}px;
  align-items: center;
`
