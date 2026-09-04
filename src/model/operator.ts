import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'

export type Operator = {
  name: string
  id: string
}

export const MAJOR_OPERATORS = new Set(['3', '5', '15', '18', '25', '34']) // ['אלקטרה אפיקים', 'דן', 'מטרופולין', 'קווים', 'אגד', 'תנופה']
export const ISRAEL_TRAIN_ID = '2'

/**
 * Build the operators list out of agencies fetched from the MOT api
 * @param agencies Agencies as returned by the gtfs_agencies API
 * @param filter Operator ID list
 * @returns List of operators
 */
export function toOperators(agencies: GtfsAgencyPydanticModel[], filter?: Set<string>): Operator[] {
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
