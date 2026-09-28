import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Car, History, Bookmark, AlertTriangle, Plus, Trash2, CheckCircle, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { VehicleDto, ChargingHistoryDto, StationDto, ReportDto } from '../../types';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'vehicles' | 'history' | 'favorites' | 'reports'>('vehicles');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Add Vehicle Form State
  const [brand, setBrand] = useState('Tata');
  const [model, setModel] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState(30.0);
  const [maxRange, setMaxRange] = useState(250.0);
  const [connectorType, setConnectorType] = useState('CCS2');

  // Fetch Vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<VehicleDto[]>({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<VehicleDto[]>('/api/users/vehicles');
      return data;
    },
    enabled: !!user,
  });

  // Fetch History
  const { data: history = [], isLoading: historyLoading } = useQuery<ChargingHistoryDto[]>({
    queryKey: ['history', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<ChargingHistoryDto[]>('/api/users/history');
      return data;
    },
    enabled: !!user,
  });

  // Fetch Favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<StationDto[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<StationDto[]>('/api/users/favorites');
      return data;
    },
    enabled: !!user,
  });

  // Add Vehicle Mutation
  const addVehicleMutation = useMutation({
    mutationFn: async (veh: VehicleDto) => {
      const { data } = await apiClient.post('/api/users/vehicles', veh);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', user?.id] });
      setShowAddVehicle(false);
      setModel('');
    },
  });

  // Delete Vehicle Mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/users/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', user?.id] });
    },
  });

  const defaultVehicles: VehicleDto[] = [
    { id: 991, brand: 'Tata', model: 'Nexon EV Max', batteryCapacity: 40.5, maxRange: 437, connectorType: 'CCS2' },
    { id: 992, brand: 'MG', model: 'ZS EV', batteryCapacity: 50.3, maxRange: 461, connectorType: 'CCS2' },
    { id: 993, brand: 'Ather', model: '450X', batteryCapacity: 3.7, maxRange: 150, connectorType: 'Type 2' },
  ];

  const activeVehicles = vehicles.length > 0 ? vehicles : defaultVehicles;

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;
    addVehicleMutation.mutate({
      brand,
      model,
      batteryCapacity,
      maxRange,
      connectorType,
    });
  };

  if (!user) return <div className="py-8 text-center text-xs text-slate-400">Loading profile data...</div>;

  return (
    <div className="space-y-6 text-left pb-10">
      {/* Profile Welcome Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl shadow-lg transition-colors flex items-center gap-5">
        <img src={user.profilePicture} alt="avatar" className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-slate-100 dark:bg-slate-800" />
        <div>
          <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-100">Welcome, {user.username}!</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user.role === 'ROLE_ADMIN' ? 'Admin Access' : 'EV Driver'}
            </span>
            {user.emailVerified && (
              <span className="text-[10px] bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'vehicles' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <span className="flex items-center gap-2"><Car className="w-4 h-4" /> My Vehicles ({vehicles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <span className="flex items-center gap-2"><History className="w-4 h-4" /> Charging Logs ({history.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'favorites' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <span className="flex items-center gap-2"><Bookmark className="w-4 h-4" /> Bookmarks ({favorites.length})</span>
        </button>
      </div>

      {/* Add Vehicle Panel */}
      {showAddVehicle && activeTab === 'vehicles' && (
        <form onSubmit={handleAddVehicle} className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Register EV Vehicle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer</label>
              <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs rounded-xl focus:outline-none">
                <option value="Tata">Tata</option>
                <option value="Hyundai">Hyundai</option>
                <option value="MG">MG</option>
                <option value="Ather">Ather</option>
                <option value="Ola">Ola</option>
                <option value="BYD">BYD</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Name</label>
              <input type="text" placeholder="e.g. Nexon EV, 450X" value={model} onChange={e => setModel(e.target.value)} required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs rounded-xl focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Battery Size (kWh)</label>
              <input type="number" value={batteryCapacity} onChange={e => setBatteryCapacity(parseFloat(e.target.value))} required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs rounded-xl focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Range (km)</label>
              <input type="number" value={maxRange} onChange={e => setMaxRange(parseFloat(e.target.value))} required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs rounded-xl focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connector Socket</label>
              <select value={connectorType} onChange={e => setConnectorType(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs rounded-xl focus:outline-none">
                <option value="CCS2">CCS2 (DC Fast)</option>
                <option value="Type 2">Type 2 (AC Slow)</option>
                <option value="AC001">AC001</option>
                <option value="DC001">DC001</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl">Save vehicle</button>
            <button type="button" onClick={() => setShowAddVehicle(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm">
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Registered EV Garage</h3>
              {!showAddVehicle && (
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add vehicle
                </button>
              )}
            </div>

            {vehiclesLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading garage...</div>
            ) : activeVehicles.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No vehicles registered yet.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activeVehicles.map((veh) => (
                  <div key={veh.id} className="p-4 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-display font-extrabold text-sm text-slate-750 dark:text-slate-200">{veh.brand} {veh.model}</p>
                      <p className="text-[10px] text-slate-450 mt-1 uppercase tracking-wider">
                        {veh.batteryCapacity} kWh &bull; {veh.maxRange} km Range &bull; {veh.connectorType}
                      </p>
                    </div>
                    {/* Don't allow deleting default fallback vehicles (ids > 990) to keep simple demo clean, or allow standard deletes */}
                    {veh.id && veh.id < 990 && (
                      <button
                        onClick={() => deleteVehicleMutation.mutate(veh.id!)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Session History Logs</h3>
            {historyLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading logs...</div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No charging logs found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{h.stationName}</p>
                      <p className="text-[10px] text-slate-400">
                        {h.vehicleModel ? `${h.vehicleModel} • ` : ''}Charged {h.energyConsumedKwh} kWh in {h.chargingDurationMinutes} mins
                      </p>
                      <p className="text-[10px] text-slate-450">{h.sessionDate ? new Date(h.sessionDate).toLocaleDateString() : ''}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">INR {h.totalCost}</p>
                      <p className="text-[9px] text-emerald-500 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                        <Leaf className="w-3 h-3 fill-current" />
                        {(h.energyConsumedKwh * 0.45).toFixed(1)} kg CO2 saved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Bookmarked Stations</h3>
            {favoritesLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading bookmarks...</div>
            ) : favorites.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No favorite stations bookmarked yet.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="p-3.5 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{fav.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{fav.address}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">₹{fav.basePricing}/kWh</span>
                      <span className="text-[10px] font-semibold text-emerald-500">{fav.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
