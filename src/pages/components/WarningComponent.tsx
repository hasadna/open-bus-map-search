import React from 'react';
import styled from 'styled-components'

interface WarningComponentProps {
    text: string;
}

const StyledDiv = styled.div`
  color: #ff9800;
  border: 1px solid #ff9800;
  width: 100%;
  min-width: 18.75em;
  height: 3.125em;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 1.0em;
  padding-left: 1.0em;
`

export const WarningComponent: React.FC<WarningComponentProps> = ({ text }) => (
    <StyledDiv>
        {text}
    </StyledDiv>
);