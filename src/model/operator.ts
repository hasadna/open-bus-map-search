import getAgencyList from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

async function getOperatorId(name: string) {
  const agencyList = await getAgencyList()
  const agency = agencyList.find((agency) => agency.agency_name === name)
  if (!agency) {
    throw new Error(`Agency ${name} not found`)
  }
  return agency.operator_ref.toString()
}

const toOperator = async (name: string): Promise<Operator> => ({
  name,
  id: await getOperatorId(name),
})

export const RELEVANT_OPERATORS = Promise.all(
  ['אגד', 'אגד תעבורה', 'דן', 'נתיב אקספרס', 'מטרופולין', 'סופרבוס', 'קווים', 'אלקטרה אפיקים']
    .sort()
    .map(toOperator),
)
