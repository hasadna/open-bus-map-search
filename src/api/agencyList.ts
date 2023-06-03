export interface Agency {
  date: string // example - "2019-07-01"
  operator_ref: number // example - 25,
  agency_name: string // example - "אלקטרה אפיקים"
}

export default async function getAgencyList(): Promise<Agency[]> {
  const res = await fetch('https://open-bus-stride-api.hasadna.org.il/gtfs_agencies/list')
  const json = await res.json()
  return json
}
