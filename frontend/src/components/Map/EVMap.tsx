import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StationDto } from '../../types';
import { Navigation, Zap } from 'lucide-react';

// Custom Marker styling utilizing L.divIcon to prevent broken image references
const createCustomIcon = (status: string, isRecommendedStop: boolean = false) => {
  let color = '#10b981'; // AVAILABLE
  if (status === 'BUSY') color = '#f59e0b';
  else if (status === 'OFFLINE') color = '#ef4444';
  
  if (isRecommendedStop) color = '#8b5cf6'; // Violet for recommended stops on route

  return L.divIcon({
    html: `<div style="
      background-color: ${color}; 
      width: 28px; 
      height: 28px; 
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background-color: white; 
        width: 10px; 
        height: 10px; 
        border-radius: 50%;
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: ${color}; width: 4px; height: 4px; border-radius: 50%;"></div>
      </div>
    </div>`,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `<div className="relative">
      <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
      <div style="
        background-color: #3b82f6; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(59,130,246,0.5);
      "></div>
    </div>`,
    className: 'user-location-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Component to dynamically pan and zoom map based on coords change
const MapUpdater: React.FC<{ center: [number, number]; zoom: number; routePoints?: [number, number][] }> = ({ center, zoom, routePoints }) => {
  const map = useMap();
  
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      // Fit bounds to show entire route
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, routePoints, map]);

  return null;
};

interface EVMapProps {
  stations: StationDto[];
  center: [number, number];
  zoom: number;
  selectedStation: StationDto | null;
  onStationSelect: (station: StationDto) => void;
  userCoords: [number, number] | null;
  onLocateUser: () => void;
  routePoints?: [number, number][];
  recommendedStops?: StationDto[];
}

const EVMap: React.FC<EVMapProps> = ({
  stations,
  center,
  zoom,
  selectedStation,
  onStationSelect,
  userCoords,
  onLocateUser,
  routePoints,
  recommendedStops = []
}) => {
  const recommendedStopIds = new Set(recommendedStops.map(s => s.id));

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner border border-slate-100 dark:border-slate-800">
      
      {/* Geolocation Trigger Button */}
      <button
        onClick={onLocateUser}
        className="absolute bottom-6 right-6 z-10 w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all text-emerald-500 dark:text-emerald-400 cursor-pointer"
        title="Find my location"
      >
        <Navigation className="w-5 h-5 fill-current" />
      </button>

      {/* Map Container */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapUpdater center={center} zoom={zoom} routePoints={routePoints} />

        {/* User Geolocation Marker */}
        {userCoords && (
          <Marker position={userCoords} icon={createUserIcon()}>
            <Popup>
              <div className="p-2 text-center text-xs font-semibold">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Render Station Markers */}
        {stations.map((station) => {
          const isRecommended = recommendedStopIds.has(station.id);
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createCustomIcon(station.status, isRecommended)}
              eventHandlers={{
                click: () => onStationSelect(station)
              }}
            >
              <Popup>
                <div className="p-3 w-48 text-left space-y-1 bg-white dark:bg-slate-900">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-500" />
                    {station.name.substring(0, 20)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{station.address.substring(0, 30)}...</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 dark:border-slate-800">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      station.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                      station.status === 'BUSY' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                      'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      {station.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      ₹{station.basePricing}/kWh
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Draw Route Polyline */}
        {routePoints && routePoints.length > 0 && (
          <Polyline 
            positions={routePoints} 
            color="#10b981" 
            weight={6} 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default EVMap;
