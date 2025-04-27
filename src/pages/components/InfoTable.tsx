export const InfoTable = ({ children }: { children?: React.ReactNode }) => {
  return (
    <table>
      <tbody>{children}</tbody>
    </table>
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
