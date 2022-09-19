import agencyList from 'open-bus-stride-client/agencies/agencyList'

export type Operator = {
  name: string
  id: string
}

const getOperatorId = (name: string) => agencyList.find((a) => a.agency_name === name)!.agency_id

const toOperator = (name: string): Operator => ({ name, id: getOperatorId(name) })

export const RELEVANT_OPERATORS: Operator[] = [
  toOperator('אגד'),
  toOperator('אגד תעבורה'),
  toOperator('דן'),
  toOperator('נתיב אקספרס'),
  toOperator('מטרופולין'),
  toOperator('סופרבוס'),
  toOperator('קווים'),
  toOperator('אלקטרה אפיקים'),
].sort((a, b) => a.name.localeCompare(b.name))
