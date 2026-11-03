import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledDiv = styled('div')({
  display: 'inline-flex',
  width: '100%',
  height: '100%',
  justifyContent: 'flex-start',
  alignItems: 'center',
})

type LabelProps = {
  text: string
}

export const Label = ({ text }: LabelProps) => (
  <StyledDiv>
    <Typography>{text}</Typography>
  </StyledDiv>
)
