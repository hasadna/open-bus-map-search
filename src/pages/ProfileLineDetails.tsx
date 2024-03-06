import React from 'react'
import styled from 'styled-components'

export interface ProfileLineDetailsProps {
  route: {
    id?: number
    date?: string
    line_ref?: number
    operator_ref?: number
    route_short_name: string
    route_long_name: string
    route_mkt?: string
    route_direction?: string
    route_alternative?: string
    agency_name: string
    route_type?: string
  }
}

export const ProfileLineDetails: React.FC<ProfileLineDetailsProps> = ({
  route: {
    id,
    date,
    line_ref,
    operator_ref,
    route_short_name,
    route_long_name,
    route_mkt,
    route_direction,
    route_alternative,
    agency_name,
    route_type,
  },
}) => {
  const data = [
    { label: 'ID', value: id },
    { label: 'Date', value: date },
    { label: 'Line Reference', value: line_ref },
    { label: 'Operator Reference', value: operator_ref },
    { label: 'Route Short Name', value: route_short_name },
    { label: 'Route Long Name', value: route_long_name },
    { label: 'Route MKT', value: route_mkt },
    { label: 'Route Direction', value: route_direction },
    { label: 'Route Alternative', value: route_alternative },
    { label: 'Agency Name', value: agency_name },
    { label: 'Route Type', value: route_type },
  ]

  return (
    <LineDetailsContainer>
      <h2>פירוט על הקו:</h2>
      <main className="line-details-container">
        {data.map(({ label, value }) => (
          <p key={label}>
            <strong>{label}:</strong> {value}
          </p>
        ))}
      </main>
    </LineDetailsContainer>
  )
}

const LineDetailsContainer = styled.div`
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  margin: 1rem 0;

  & h2 {
    margin-bottom: 12px;
    text-align: center;
  }

  & div {
    direction: ltr;
  }

  & p {
    margin: 8px 0;
  }

  & main {
    direction: ltr;
    width: 80%;
  }
`
