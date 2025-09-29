// src/pages/MainPage.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MainPage = ({ nodes, monitoringData }) => {
  const [mapCenter, setMapCenter] = useState([19.2187, 73.1256]); // Default center

  // Optional: recenter map based on first node
  useEffect(() => {
    if (nodes.length > 0 && nodes[0].lat && nodes[0].lng) {
      setMapCenter([nodes[0].lat, nodes[0].lng]);
    }
  }, [nodes]);

  const isNodeOnline = (node) => {
    const data = monitoringData[node.twid];
    if (!data || !data.lastSeen) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - data.lastSeen < fiveMinutes;
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <h1 style={{ textAlign: 'center', margin: '1rem 0' }}>Tower Map View</h1>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: '100%', height: '90%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`}
          id="mapbox/streets-v11"
          tileSize={512}
          zoomOffset={-1}
          attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {nodes.map((node) => {
          const online = isNodeOnline(node);
          return (
            <Marker key={node.id} position={[node.lat, node.lng]}>
              <Popup>
                <strong>{node.id}</strong> <br />
                Location: {node.location} <br />
                Status: {online ? 'Online' : 'Offline'}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MainPage;
