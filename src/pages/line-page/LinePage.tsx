import React, { useCallback, useEffect, useState } from 'react'
import { Input, Layout, TimePicker } from 'antd'
import LineSelector from './LineSelector'
import DirectionSelector from './DirectionSelector'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import axios from 'axios'
import { getStops } from '../../api/gtfs';


const BASELINE_TIME = new Date('2022-09-12T06:00:00Z');


const LinePage = () => {
  const [position, setPosition] = useState<LatLngTuple>()
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setPosition([position.coords.latitude, position.coords.longitude]),
    )
  }, [])

  useEffect(() => {
    getStops(BASELINE_TIME)
  });

  const onSearch = useCallback(async () => {
    const result = await axios.get(
      'https://nominatim.openstreetmap.org/search?countrycodes=il&format=json&q=' +
      encodeURIComponent(query),
    )
    const data = result.data as any[]
    console.log('search', data)
    if (data.length === 0) {
      return
    }
    setPosition([data[0]['lat'] as number, data[0]['lon'] as number])
  }, [setPosition, query])

  return (
    <div>
      <Input
        type="text"
        value={ query }
        onChange={ (e) => setQuery(e.target.value) }
        style={ {margin: '0 10px 0 10px', width: 320} }
      />
      <LineSelector/>
      <DirectionSelector/>
      <TimePicker/>
      <div onClick={ onSearch } style={ {color: 'blue', cursor: 'pointer'} }>
        SEARCH
      </div>
      <Layout style={ {height: 600, alignItems: 'center', justifyContent: 'center'} }>
        { position && (
          <MapContainer
            center={ position }
            zoom={ 13 }
            zoomControl
            scrollWheelZoom
            style={ {height: '100vh', width: '100%'} }>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={ position }
              icon={ L.icon({
                iconUrl: './marker-icon.png',
              }) }>
              <Popup>
                A pretty CSS3 popup. <br/> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        ) }
      </Layout>
    </div>
  )
}

export default LinePage
