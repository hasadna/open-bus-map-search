import getAgencyList from 'src/api/agencyList'

export type Operator = {
  name: string
  id: string
}

export const getRelevantOperators = async () => {
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
  const agencyList = await getAgencyList()
  const agencyMap = new Map()
  // convert to Map
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
