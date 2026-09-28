import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import SOSModal from './components/Layout/SOSModal';
import EVMap from './components/Map/EVMap';
import StationDetailsDrawer from './components/Map/StationDetailsDrawer';
import SearchFilters, { FilterState } from './components/SearchFilters';
import RoutePlanner from './components/RoutePlanner/RoutePlanner';
import AIRecommendations from './components/AIRecommendations/AIRecommendations';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserProfile from './components/Profile/UserProfile';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import apiClient from './api/apiClient';
import { StationDto, RouteResponse } from './types';
import { ShieldAlert, MapPin, Zap } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sosOpen, setSosOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationDto | null>(null);
  
  // Geolocation states
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Central India
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Route points & recommended stops
  const [routeResponse, setRouteResponse] = useState<RouteResponse | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    radius: 9999,
    connectorType: '',
    fastCharging: 'all',
    status: 'all',
    network: '',
  });

  // Track map centering on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(loc);
          setMapCenter(loc);
          setMapZoom(11);
        },
        () => console.log('Location access denied. Using central India default.')
      );
    }
  }, []);

  // Fetch stations dynamically using TanStack Query
  const { data: stations = [], isLoading: stationsLoading } = useQuery<StationDto[]>({
    queryKey: ['stations', searchTerm, filters, userCoords],
    queryFn: async () => {
      // Build filter query parameters
      let url = `/api/stations?search=${encodeURIComponent(searchTerm)}`;
      if (filters.connectorType) url += `&connectorType=${filters.connectorType}`;
      if (filters.fastCharging !== 'all') url += `&fastCharging=${filters.fastCharging === 'fast'}`;
      if (filters.status !== 'all') url += `&status=${filters.status}`;
      if (filters.network) url += `&network=${encodeURIComponent(filters.network)}`;
      
      const { data } = await apiClient.get<StationDto[]>(url);

      // Handle radius filtering client-side or check coords
      if (filters.radius !== 9999 && userCoords) {
        return data.filter(s => {
          const dist = calculateDistance(userCoords[0], userCoords[1], s.latitude, s.longitude);
          return dist <= filters.radius;
        });
      }
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocateUser = () => {
    if (userCoords) {
      setMapCenter(userCoords);
      setMapZoom(13);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(loc);
          setMapCenter(loc);
          setMapZoom(13);
        },
        () => alert('Could not resolve GPS location.')
      );
    }
  };

  const handleInspectStation = (lat: number, lng: number, id: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
    
    // Find station details to open drawer
    const found = stations.find(s => s.id === id);
    if (found) {
      setSelectedStation(found);
    } else {
      // Fetch details directly if not in filtered list
      apiClient.get<StationDto>(`/api/stations/${id}`).then(({ data }) => {
        setSelectedStation(data);
      });
    }
    
    navigate('/'); // Redirect to map page to show the selection
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-semibold">
        Initializing ChargeWise India...
      </div>
    );
  }

  // Define routes where map is visible on the right panel
  const isMapRoute = ['/', '/routes', '/recommendations'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      
      {/* Route guards for login & signup */}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        
        {/* Main Application Layout wrapper */}
        <Route 
          path="/*" 
          element={
            user ? (
              <>
                {/* Sidebar Navigation */}
                <Sidebar onSOSClick={() => setSosOpen(true)} />

                {/* Main Content Workspace (shifted right to account for Sidebar) */}
                <div className="flex-1 pl-64 flex flex-col min-h-screen">
                  {/* Top Bar Header */}
                  <Header onSearch={setSearchTerm} />

                  {/* Dynamic split page layout */}
                  <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden h-[calc(100vh-64px)]">
                    
                    {/* Left Column: Context Views (e.g. dashboards, listings, profile tables) */}
                    <div className={`${isMapRoute ? 'col-span-6' : 'col-span-12'} h-full overflow-y-auto pr-2`}>
                      <Routes>
                        <Route 
                          path="/" 
                          element={
                            <div className="space-y-6">
                              {/* Station Filter Component */}
                              <SearchFilters 
                                filters={filters}
                                onFilterChange={setFilters}
                                onReset={() => setFilters({
                                  radius: 9999,
                                  connectorType: '',
                                  fastCharging: 'all',
                                  status: 'all',
                                  network: '',
                                })}
                              />

                              {/* Station List Cards */}
                              <div className="space-y-4">
                                <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider text-left">
                                  Available EV Stations ({stations.length})
                                </h3>

                                {stationsLoading ? (
                                  <div className="py-8 text-center text-xs text-slate-400">Locating chargers...</div>
                                ) : stations.length === 0 ? (
                                  <div className="py-8 text-center text-xs text-slate-400">No stations match filters.</div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3.5">
                                    {stations.slice(0, 10).map((st) => (
                                      <div
                                        key={st.id}
                                        onClick={() => {
                                          setSelectedStation(st);
                                          setMapCenter([st.latitude, st.longitude]);
                                          setMapZoom(14);
                                        }}
                                        className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-left cursor-pointer transition-all hover:shadow-md hover:border-emerald-500/25 flex items-center justify-between"
                                      >
                                        <div className="space-y-1">
                                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {st.network}
                                          </span>
                                          <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-1">{st.name}</h4>
                                          <p className="text-[11px] text-slate-450">{st.address}</p>
                                        </div>

                                        <div className="text-right">
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                            st.status === 'AVAILABLE' ? 'bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/30' :
                                            st.status === 'BUSY' ? 'bg-amber-100/60 text-amber-800 dark:bg-amber-950/30' :
                                            'bg-red-100/60 text-red-850 dark:bg-red-950/30'
                                          }`}>
                                            {st.status}
                                          </span>
                                          <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 mt-2">₹{st.basePricing}/kWh</p>
                                        </div>
                                      </div>
                                    ))}
                                    {stations.length > 10 && (
                                      <p className="text-center text-[10px] text-slate-400 py-2">
                                        Showing top 10 stations. Zoom or pan to filter list.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          } 
                        />
                        
                        <Route 
                          path="/routes" 
                          element={<RoutePlanner onRouteCalculated={setRouteResponse} />} 
                        />
                        
                        <Route 
                          path="/recommendations" 
                          element={<AIRecommendations onInspectStation={handleInspectStation} />} 
                        />
                        
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                      </Routes>
                    </div>

                    {/* Right Column: GIS Interactive Map View */}
                    {isMapRoute && (
                      <div className="col-span-6 h-full relative">
                        <EVMap
                          stations={stations}
                          center={mapCenter}
                          zoom={mapZoom}
                          selectedStation={selectedStation}
                          onStationSelect={(st) => setSelectedStation(st)}
                          userCoords={userCoords}
                          onLocateUser={handleLocateUser}
                          routePoints={routeResponse?.routePoints}
                          recommendedStops={routeResponse?.recommendedStops}
                        />
                      </div>
                    )}
                  </div>

                  {/* Detail Drawer (appears when station is clicked) */}
                  <StationDetailsDrawer
                    station={selectedStation}
                    onClose={() => setSelectedStation(null)}
                  />

                  {/* SOS Emergency Modal */}
                  <SOSModal 
                    isOpen={sosOpen} 
                    onClose={() => setSosOpen(false)} 
                  />
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
