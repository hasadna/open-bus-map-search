import { useEffect, useState } from 'react'
import { VelocityAggregation } from './useVelocityAggregationData'

interface TileCoords {
  x: number
  y: number
  z: number
}

interface TiledVelocityDataProps {
  zoom: number
  center: [number, number]
  mapBounds: { north: number; south: number; east: number; west: number }
}

// Convert lat/lng to tile coordinates
function latLngToTile(lat: number, lng: number, zoom: number): TileCoords {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
  const y = Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
      2) *
      Math.pow(2, zoom),
  )
  return { x, y, z: zoom }
}

// Convert tile coordinates to lat/lng bounds
function tileToBounds(x: number, y: number, z: number) {
  const n = Math.pow(2, z)
  const west = (x / n) * 360 - 180
  const east = ((x + 1) / n) * 360 - 180
  const north = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI)
  const south = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI)
  return { north, south, east, west }
}

// Get all tiles that intersect with the map bounds
function getTilesInBounds(
  mapBounds: { north: number; south: number; east: number; west: number },
  zoom: number,
): TileCoords[] {
  const topLeft = latLngToTile(mapBounds.north, mapBounds.west, zoom)
  const bottomRight = latLngToTile(mapBounds.south, mapBounds.east, zoom)

  const tiles: TileCoords[] = []
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      tiles.push({ x, y, z: zoom })
    }
  }
  return tiles
}

export function useTiledVelocityData({ zoom, mapBounds }: TiledVelocityDataProps) {
  const [data, setData] = useState<VelocityAggregation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedTiles, setLoadedTiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Use fixed zoom 8 for tiling to create larger, fewer tiles
    const tileZoom = 8
    const tiles = getTilesInBounds(mapBounds, tileZoom)

    const newTiles = tiles.filter((tile) => !loadedTiles.has(`${tile.x}-${tile.y}-${tile.z}`))

    if (newTiles.length === 0) return

    setLoading(true)

    const fetchTile = async (tile: TileCoords) => {
      const bounds = tileToBounds(tile.x, tile.y, tile.z)
      const apiUrl = `https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2025-01-01T00%3A00%3A00&lon_min=${bounds.west}&lon_max=${bounds.east}&lat_min=${bounds.south}&lat_max=${bounds.north}&rounding_precision=2`

      try {
        const res = await fetch(apiUrl)
        if (!res.ok) {
          return []
        }
        const json = await res.json()

        if (Array.isArray(json)) {
          const filtered = json.filter(
            (item): item is VelocityAggregation =>
              item.total_sample_count > 4 &&
              typeof item.rounded_lon === 'number' &&
              typeof item.rounded_lat === 'number' &&
              typeof item.total_sample_count === 'number' &&
              typeof item.average_rolling_avg === 'number' &&
              typeof item.stddev_rolling_avg === 'number',
          )
          return filtered
        }
        return []
      } catch (err) {
        console.log(`Tile ${tile.x}-${tile.y} failed:`, err)
        return []
      }
    }

    Promise.all(newTiles.map(fetchTile))
      .then((results) => {
        const newData = results.flat()
        setData((prev) => [...prev, ...newData])
        setLoadedTiles((prev) => {
          const updated = new Set(prev)
          newTiles.forEach((tile) => updated.add(`${tile.x}-${tile.y}-${tile.z}`))
          return updated
        })
        setError(null)
      })
      .catch((err) => setError(String(err?.message || err)))
      .finally(() => setLoading(false))
  }, [zoom, JSON.stringify(mapBounds)])

  return { data, loading, error }
}
