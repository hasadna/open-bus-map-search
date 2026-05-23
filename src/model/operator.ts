import { getAgencyList } from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

export const MAJOR_OPERATORS = new Set(['3', '5', '15', '18', '25', '34']) // ['אלקטרה אפיקים', 'דן', 'מטרופולין', 'קווים', 'אגד', 'תנופה']
export const ISRAEL_TRAIN_ID = '2'

/**
 * Get operators list, based on agencies fetched from MOT api
 * @param filter Operator ID list
 * @returns List of operators
 */
export async function getOperators(filter?: Set<string>): Promise<Operator[]> {
  const agencies = await getAgencyList()
  const operators = new Map<string, Operator>()

  for (const agency of agencies) {
    const id = String(agency.operatorRef)

    if (operators.has(id) || (filter && !filter.has(id))) {
      continue
    }

    operators.set(id, { id, name: agency.agencyName })
  }
  return Array.from(operators.values())
}
