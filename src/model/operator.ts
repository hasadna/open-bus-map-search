import getAgencyList from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

export const getRelevantOperators = async (onlyRelevantOperators: boolean) => {
  const agencyList = await getAgencyList()
  if (!onlyRelevantOperators) {
    const allOperators = Array.from(
      agencyList.map((agency) => ({
        name: agency.agency_name,
        id: agency.operator_ref.toString(),
      })),
    )
    allOperators.push({ name: 'הכל', id: '' })
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
  const agencyMap = new Map()
  agencyList.forEach((obj) => {
    agencyMap.set(obj.agency_name, obj)
  })

  const res = relevant.reduce((acc: Operator[], name: string): Operator[] => {
    return agencyMap.has(name)
      ? [...acc, { name, id: agencyMap.get(name)?.operator_ref.toString() }]
      : acc
  }, [])
  return res
}
