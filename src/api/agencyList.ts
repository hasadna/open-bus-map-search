export interface Agency {
  date: string // example - "2019-07-01"
  operator_ref: number // example - 25,
  agency_name: string // example - "אלקטרה אפיקים"
}

let json: Promise<Agency[]>

export default async function getAgencyList(): Promise<Agency[]> {
  if (!json) {
    json = fetch('https://open-bus-stride-api.hasadna.org.il/gtfs_agencies/list').then((response) =>
      response.json(),
    )
  }
  return json
}
