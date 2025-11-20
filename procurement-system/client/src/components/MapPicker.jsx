import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default location - สำนักงานเทศบาลตำบลหัวทะเล จ.นครราชสีมา
const DEFAULT_LOCATION = {
  lat: 14.9753,
  lng: 102.0983
};

/**
 * Component สำหรับจัดการ map events
 */
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

/**
 * MapPicker Component
 * ใช้สำหรับเลือกตำแหน่งบนแผนที่
 *
 * @param {Object} props
 * @param {Object} props.location - GeoJSON Point object { type: 'Point', coordinates: [lng, lat] }
 * @param {Function} props.onChange - Callback function when location changes
 * @param {number} props.height - Map height in pixels (default: 400)
 * @param {boolean} props.disabled - Disable map interaction (default: false)
 */
const MapPicker = ({ location, onChange, height = 400, disabled = false }) => {
  // Convert GeoJSON to Leaflet format { lat, lng }
  const getLeafletPosition = (geoJsonLocation) => {
    if (!geoJsonLocation || !geoJsonLocation.coordinates) {
      return DEFAULT_LOCATION;
    }
    const [lng, lat] = geoJsonLocation.coordinates;
    return { lat, lng };
  };

  const [position, setPosition] = useState(getLeafletPosition(location));
  const [isMapReady, setIsMapReady] = useState(false);

  // Update position when location prop changes
  useEffect(() => {
    setPosition(getLeafletPosition(location));
  }, [location]);

  // Handle location selection
  const handleLocationSelect = (latlng) => {
    if (disabled) return;

    const newPosition = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPosition);

    // Convert to GeoJSON format and notify parent
    const geoJson = {
      type: 'Point',
      coordinates: [latlng.lng, latlng.lat]
    };
    onChange(geoJson);
  };

  // Handle use current location button
  const handleUseCurrentLocation = () => {
    if (disabled) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPosition = { lat: latitude, lng: longitude };
          setPosition(newPosition);

          const geoJson = {
            type: 'Point',
            coordinates: [longitude, latitude]
          };
          onChange(geoJson);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาตรวจสอบการอนุญาตของเบราว์เซอร์');
        }
      );
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับการใช้ตำแหน่งปัจจุบัน');
    }
  };

  // Reset to default location
  const handleResetLocation = () => {
    if (disabled) return;

    setPosition(DEFAULT_LOCATION);
    const geoJson = {
      type: 'Point',
      coordinates: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat]
    };
    onChange(geoJson);
  };

  return (
    <div className="space-y-2">
      {/* Location info */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          <i className="fas fa-map-marker-alt mr-2"></i>
          ตำแหน่ง: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={disabled}
            className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="ใช้ตำแหน่งปัจจุบันของคุณ"
          >
            <i className="fas fa-location-arrow mr-1"></i>
            ตำแหน่งปัจจุบัน
          </button>
          <button
            type="button"
            onClick={handleResetLocation}
            disabled={disabled}
            className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="รีเซ็ตเป็นตำแหน่งเริ่มต้น (สำนักงานเทศบาล)"
          >
            <i className="fas fa-undo mr-1"></i>
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* Map container */}
      <div
        className={`relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={!disabled}
          doubleClickZoom={!disabled}
          dragging={!disabled}
          zoomControl={!disabled}
          whenReady={() => setIsMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>

        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <i className="fas fa-info-circle mr-1"></i>
        คลิกบนแผนที่เพื่อเลือกตำแหน่งโครงการ
      </p>
    </div>
  );
};

export default MapPicker;
