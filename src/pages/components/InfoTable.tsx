import styled from 'styled-components'

export const InfoTable = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Table>
      <tbody>{children}</tbody>
    </Table>
  )
}

export const InfoItem = ({ lable, value }: { lable: React.ReactNode; value?: React.ReactNode }) => {
  return (
    <tr>
      <td>
        <strong>{lable}:</strong>
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
