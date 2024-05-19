import styled from 'styled-components'
import Typography from '@mui/material/Typography'

const StyledDiv = styled.div`
  display: inline-flex;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  align-items: center;
`

type LabelProps = {
  text: string
}

export const Label = ({ text }: LabelProps) => (
  <StyledDiv>
    <Typography>{text}</Typography>
  </StyledDiv>
)
