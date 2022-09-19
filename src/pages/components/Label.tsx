import React from 'react'
import styled from 'styled-components'

const StyledDiv = styled.div`
  min-width: 80px;
`

type LabelProps = {
  text: string
}

export const Label = ({ text }: LabelProps) => <StyledDiv>{text}</StyledDiv>
