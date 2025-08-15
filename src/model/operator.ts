import { getAgencyList } from 'src/api/agencyList'

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
  const seen = new Map<string, Operator>()
  for (const agency of agencyList) {
    const id = agency.operatorRef.toString()
    if (!seen.has(id)) {
      if (!filter || filter.includes(id)) {
        seen.set(id, { name: agency.agencyName, id })
      }
    }
  }
  return Array.from(seen.values())
}
