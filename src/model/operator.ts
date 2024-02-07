import getAgencyList, { Agency } from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

export const getRelevantOperators = async (onlyRelevantOperators: boolean) => {
  const agencyList = await getAgencyList()
  if (!onlyRelevantOperators) {
    const allOperators = agencyList.map((agency) => ({
      name: agency.agency_name,
      id: agency.operator_ref.toString(),
    }))
    return allOperators
  }
  const relevant = [
    'אגד',
    'אגד תעבורה',
    'אלקטרה אפיקים',
    'דן',
    'מטרופולין',
    'נתיב אקספרס',
    'סופרבוס',
    'קווים',
    'תנופה',
  ]
  const agencyMap: Map<string, Agency> = new Map()
  agencyList.forEach((obj) => {
    if (obj) {
      agencyMap.set(obj.agency_name, obj)
    }
  })

  const res = relevant.reduce((acc: Operator[], name: string): Operator[] => {
    return agencyMap.has(name)
      ? [...acc, { name, id: (agencyMap.get(name) as Agency).operator_ref.toString() }]
      : acc
  }, [])
  return res
}
