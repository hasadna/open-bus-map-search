import styled from 'styled-components'

export const InfoTable = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Table>
      <tbody>{children}</tbody>
    </Table>
  )
}

export const InfoItem = ({
  label,
  value,
}: {
  label?: React.ReactNode
  value?: React.ReactNode
}) => {
  return (
    <tr>
      <td>
        <strong>{label}:</strong>
      </td>
      <td>{value ?? '-'}</td>
    </tr>
  )
}

const Table = styled.table`
  border-collapse: collapse;
  & > * {
    font-size: 1em;
  }
  td {
    padding: 0.125rem;
  }
`
