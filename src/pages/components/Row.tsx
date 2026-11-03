import { styled } from '@mui/material/styles'
import { MARGIN_MEDIUM } from 'src/resources/sizes'

export const Row = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  gap: `${MARGIN_MEDIUM}px`,
  alignItems: 'center',
})
