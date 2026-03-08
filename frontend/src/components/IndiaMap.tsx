import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockSlots } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// City coordinates for mock data
const cityCoords: Record<string, [number, number]> = {
  'Bangalore': [12.9716, 77.5946],
  'Whitefield': [12.9698, 77.7500],
  'Mumbai': [19.0760, 72.8777],
  'Pune': [18.5204, 73.8567],
  'Chennai': [13.0827, 80.2707],
  'New Delhi': [28.6139, 77.2090],
  'Dwarka': [28.5921, 77.0460],
  'Hauz Khas': [28.5494, 77.2001],
  'Mysore': [12.2958, 76.6394],
  'Coimbatore': [11.0168, 76.9558],
};

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapControllerProps {
  selectedCity?: string;
}

function MapController({ selectedCity }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedCity && cityCoords[selectedCity]) {
      map.flyTo(cityCoords[selectedCity], 13, { duration: 1.5 });
    }
  }, [selectedCity, map]);

  return null;
}

interface IndiaMapProps {
  selectedCity?: string;
  onSlotClick?: (slotId: string) => void;
}

const IndiaMap = ({ selectedCity, onSlotClick }: IndiaMapProps) => {
  const availableSlots = mockSlots.filter(s => s.isAvailable);

  return (
    <div className="rounded-lg overflow-hidden border border-border h-[300px] lg:h-[400px]">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ background: 'hsl(var(--surface))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedCity={selectedCity} />
        {availableSlots.map(slot => {
          const coords = cityCoords[slot.city];
          if (!coords) return null;
          // Add slight offset for same-city slots
          const offset = (parseInt(slot.id.replace('s', '')) * 0.003);
          return (
            <Marker key={slot.id} position={[coords[0] + offset, coords[1] + offset]} icon={customIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-bold text-sm mb-1">{slot.title}</p>
                  <p className="text-xs text-gray-600 mb-1">{slot.address}, {slot.city}</p>
                  <div className="flex items-center gap-1 text-xs mb-2">
                    <Star className="h-3 w-3 text-accent fill-current" />
                    <span>{slot.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{slot.availableSpaces} spots</span>
                    <span className="mx-1">•</span>
                    <span className="font-bold text-accent">₹{slot.pricePerHour}/hr</span>
                  </div>
                  <Link
                    to={`/vehicle/slot/${slot.id}`}
                    className="block text-center bg-accent text-accent-foreground text-xs px-3 py-1.5 rounded-md hover:bg-accent/90 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
