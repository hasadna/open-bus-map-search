import React from 'react'
import styled from 'styled-components'

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

export const Label = ({ text }: LabelProps) => <StyledDiv>{text}</StyledDiv>
