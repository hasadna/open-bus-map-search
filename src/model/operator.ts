import getAgencyList from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

export const MAJOR_OPERATORS = ['3', '5', '15', '18', '25', '34'] // ['אלקטרה אפיקים', 'דן', 'מטרופולין', 'קווים', 'אגד', 'תנופה']

/**
 * Get operators list, based on agencies fetched from MOT api
 * @param filter Operator ID list
 * @returns List of operators
 */
export async function getOperators(filter?: string[]): Promise<Operator[]> {
  const agencyList = await getAgencyList()
  const allOperators: Operator[] = agencyList.map((agency) => ({
    name: agency.agencyName,
    id: agency.operatorRef.toString(),
  }))
  const res = allOperators.filter((op, i, a) => a.findIndex((op2) => op2.id === op.id) === i) // Filter duplicates

  return !filter ? res : res.filter((operator) => filter.includes(operator.id))
}
