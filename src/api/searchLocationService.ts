import axios from 'axios'
import { LatLngTuple } from 'leaflet'

export async function searchLocationByQueryAsync(query: string): Promise<LatLngTuple | null> {
  const result = await axios.get(
    'https://nominatim.openstreetmap.org/search?countrycodes=il&format=json&q=' +
      encodeURIComponent(query),
  )
  const data = result.data
  if (data.length === 0) {
    return null
  }
  return [data[0]['lat'] as number, data[0]['lon'] as number]
}
