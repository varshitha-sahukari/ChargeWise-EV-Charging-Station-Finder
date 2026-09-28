import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Route, MapPin, Zap, Navigation, Clock, CreditCard, Leaf } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { RouteRequest, RouteResponse, VehicleDto } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface RoutePlannerProps {
  onRouteCalculated: (route: RouteResponse | null) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteCalculated }) => {
  const { user } = useAuth();
  
  const [startQuery, setStartQuery] = useState('Delhi');
  const [endQuery, setEndQuery] = useState('Jaipur');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [initialSoc, setInitialSoc] = useState(100);
  const [targetSoc, setTargetSoc] = useState(20);
  const [geocoding, setGeocoding] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);

  // Fetch user's registered vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<VehicleDto[]>({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<VehicleDto[]>('/api/users/vehicles');
      return data;
    },
    enabled: !!user,
  });

  // Default vehicles fallback in case they haven't added any yet
  const defaultVehicles: VehicleDto[] = [
    { id: 991, brand: 'Tata', model: 'Nexon EV Max', batteryCapacity: 40.5, maxRange: 437, connectorType: 'CCS2' },
    { id: 992, brand: 'MG', model: 'ZS EV', batteryCapacity: 50.3, maxRange: 461, connectorType: 'CCS2' },
    { id: 993, brand: 'Ather', model: '450X', batteryCapacity: 3.7, maxRange: 150, connectorType: 'Type 2' },
  ];

  const activeVehicles = vehicles.length > 0 ? vehicles : defaultVehicles;

  // Set default vehicle selection
  React.useEffect(() => {
    if (activeVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(activeVehicles[0].id?.toString() || '');
    }
  }, [activeVehicles]);

  // Geocode address using Nominatim (Free)
  const geocodeAddress = async (query: string) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`);
    const data = await res.json();
    if (data.length === 0) {
      throw new Error(`Address not found: ${query}`);
    }
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      name: data[0].display_name
    };
  };

  // Route calculation mutation
  const routeMutation = useMutation({
    mutationFn: async (req: RouteRequest) => {
      const { data } = await apiClient.post<RouteResponse>('/api/route/calculate', req);
      return data;
    },
    onSuccess: (data) => {
      setRouteResult(data);
      onRouteCalculated(data);
    },
    onError: (err) => {
      alert("Error calculating route: Make sure cities are typed correctly.");
      console.error(err);
    }
  });

  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startQuery.trim() || !endQuery.trim() || !selectedVehicleId) return;

    setGeocoding(true);
    try {
      // 1. Geocode start and end points
      const startLoc = await geocodeAddress(startQuery);
      const endLoc = await geocodeAddress(endQuery);

      // 2. Submit route request to Spring Boot backend
      routeMutation.mutate({
        startLat: startLoc.lat,
        startLng: startLoc.lon,
        endLat: endLoc.lat,
        endLng: endLoc.lon,
        vehicleId: parseInt(selectedVehicleId),
        initialSoc,
        targetSoc
      });
    } catch (err: any) {
      alert(err.message || "Failed to resolve coordinates.");
    } finally {
      setGeocoding(false);
    }
  };

  const currentVehicle = activeVehicles.find(v => v.id?.toString() === selectedVehicleId);

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl shadow-lg transition-colors">
        <h2 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-emerald-500" />
          Plan Smart EV Route
        </h2>

        <form onSubmit={handlePlanRoute} className="space-y-4">
          {/* Geocoding Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> Source Point
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi, Gurugram"
                value={startQuery}
                onChange={(e) => setStartQuery(e.target.value)}
                required
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" /> Destination Point
              </label>
              <input
                type="text"
                placeholder="e.g. Jaipur, Bengaluru"
                value={endQuery}
                onChange={(e) => setEndQuery(e.target.value)}
                required
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select EV Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              required
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-all"
            >
              {activeVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.batteryCapacity} kWh, Range: {v.maxRange}km, {v.connectorType})
                </option>
              ))}
            </select>
          </div>

          {/* SOC Sliders */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start SOC (%)</label>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{initialSoc}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={initialSoc}
                onChange={(e) => setInitialSoc(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Charge Threshold (%)</label>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{targetSoc}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={targetSoc}
                onChange={(e) => setTargetSoc(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={geocoding || routeMutation.isPending}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mt-2"
          >
            {geocoding ? 'Resolving Coordinates...' : routeMutation.isPending ? 'Calculating EV stops...' : 'Plan Optimal Route'}
          </button>
        </form>
      </div>

      {/* Route Estimation Result Summary */}
      {routeResult && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-6 transition-all duration-300">
          <div className="border-b border-slate-200/50 dark:border-slate-800 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">Route Overview</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Estimated via ChargeWise path intelligence</p>
          </div>

          {/* Cards metrics */}
          <div className="grid grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl shadow-inner border border-slate-100/50 dark:border-slate-800/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-450 uppercase leading-none">Distance</p>
                <p className="font-display font-bold text-xs mt-1 text-slate-700 dark:text-slate-200">{routeResult.distanceKm} km</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl shadow-inner border border-slate-100/50 dark:border-slate-800/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-450 uppercase leading-none">Total Time</p>
                <p className="font-display font-bold text-xs mt-1 text-slate-700 dark:text-slate-200">
                  {Math.floor((routeResult.travelTimeMinutes + routeResult.chargingTimeMinutes) / 60)}h {Math.round((routeResult.travelTimeMinutes + routeResult.chargingTimeMinutes) % 60)}m
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl shadow-inner border border-slate-100/50 dark:border-slate-800/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-450 uppercase leading-none">Carbon Saved</p>
                <p className="font-display font-bold text-xs mt-1 text-emerald-500">{(routeResult.distanceKm * 0.12).toFixed(1)} kg</p>
              </div>
            </div>
          </div>

          {/* Battery depletion summary */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/30 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-350">Arrival SOC (Target Destination)</span>
              <span className={`font-bold ${routeResult.arrivalSoc < targetSoc ? 'text-red-500' : 'text-emerald-500'}`}>
                {routeResult.arrivalSoc}%
              </span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${routeResult.arrivalSoc < targetSoc ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${routeResult.arrivalSoc}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <div>
                <p>Charging Cost</p>
                <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">INR {routeResult.totalChargingCost}</p>
              </div>
              <div>
                <p>Stops Required</p>
                <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">{routeResult.recommendedStops.length} stop(s)</p>
              </div>
            </div>
          </div>

          {/* List of recommended stops */}
          {routeResult.recommendedStops.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Recommended Charging Stops</h4>
              <div className="space-y-2">
                {routeResult.recommendedStops.map((stop, index) => (
                  <div 
                    key={stop.id}
                    className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100/50 dark:border-slate-800/30 relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 w-8 h-8 bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center rounded-bl-xl shadow-inner">
                      #{index + 1}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-500 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-current animate-pulse" />
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{stop.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Plug Compatibility: {currentVehicle?.connectorType} ({stop.network})</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Pricing: ₹{stop.basePricing}/kWh &bull; Rating: {stop.averageRating} ★</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
