import React, { useCallback, useEffect, useState } from 'react'
import { Input, Layout } from 'antd'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import { searchLocationByQueryAsync } from 'src/api/searchLocationService'

const MapPage = () => {
  const [position, setPosition] = useState<LatLngTuple>()
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setPosition([position.coords.latitude, position.coords.longitude]),
    )
  }, [])

  const onSearch = useCallback(async () => {
    const searchResult = await searchLocationByQueryAsync(query)
    if (searchResult) {
      setPosition(searchResult)
    }
  }, [setPosition, query])

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ margin: '0 10px 0 10px', width: 320 }}
      />
      <div onClick={onSearch} style={{ color: 'blue', cursor: 'pointer' }}>
        SEARCH
      </div>
      <Layout style={{ height: 600, alignItems: 'center', justifyContent: 'center' }}>
        {position && (
          <MapContainer
            center={position}
            zoom={13}
            zoomControl
            scrollWheelZoom
            style={{ height: '100vh', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              icon={L.icon({
                iconUrl: './marker-icon.png',
              })}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </Layout>
    </div>
  )
}

export default MapPage
