import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';


function App() {

  const [position, setPosition] = useState<GeolocationCoordinates>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => setPosition(position.coords)
    )
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          🚌 Our bus is open! 🚌
        </p>
          {
            position && <MapContainer
                  center={ [position.latitude, position.longitude] }
                  zoom={ 13 }
                  zoomControl
                  scrollWheelZoom
                  style={{height: "100vh", width: "100%"}}
              >
                  <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={ [position.latitude, position.longitude] }
                  icon={L.icon({
                    iconUrl: "./marker-icon.png",
                  })}
                  >
                      <Popup>
                          A pretty CSS3 popup. <br/> Easily customizable.
                      </Popup>
                  </Marker>
              </MapContainer>
          }
      </header>
    </div>
  );
}

export default App;
