'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
}

export default function Map({ reports = [], onMarkerClick, onMapClick, center: propCenter, zoom: propZoom, className = '' }) {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation && !propCenter) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, [propCenter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'fixed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reported':
        return 'Reported';
      case 'in_progress':
        return 'In Progress';
      case 'fixed':
        return 'Fixed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const finalCenter = propCenter || mapCenter;
  const finalZoom = propZoom || 13;

  return (
    <div className={`w-full h-full relative ${className}`}>
      <MapContainer
        center={finalCenter}
        zoom={finalZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(report),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">
                  {report.issueType
                    ? report.issueType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                    : 'Hazard'}
                </h3>
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt={report.issueType}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {getStatusText(report.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

