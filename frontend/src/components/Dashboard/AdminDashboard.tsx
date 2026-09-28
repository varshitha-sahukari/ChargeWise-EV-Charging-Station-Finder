import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, AlertTriangle, Users, Settings, Plus, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { ReportDto, StationDto, UserDto } from '../../types';

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'reports' | 'stations' | 'users'>('reports');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Station Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [network, setNetwork] = useState('Tata Power EZ Charge');
  const [state, setState] = useState('Delhi');
  const [pinCode, setPinCode] = useState('110001');
  const [basePricing, setBasePricing] = useState(15.0);

  // Fetch Reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<ReportDto[]>({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportDto[]>('/api/admin/reports');
      return data;
    },
  });

  // Fetch Users
  const { data: users = [], isLoading: usersLoading } = useQuery<UserDto[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserDto[]>('/api/admin/users');
      return data;
    },
  });

  // Fetch Stations
  const { data: stations = [], isLoading: stationsLoading } = useQuery<StationDto[]>({
    queryKey: ['admin-stations'],
    queryFn: async () => {
      const { data } = await apiClient.get<StationDto[]>('/api/stations');
      return data;
    },
  });

  // Resolve Report Mutation
  const resolveReportMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/api/admin/reports/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  // Change Station Status Mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await apiClient.put(`/api/admin/stations/${id}/status?status=${status}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stations'] });
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  // Delete Station Mutation
  const deleteStationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/admin/stations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stations'] });
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  // Add Station Mutation
  const addStationMutation = useMutation({
    mutationFn: async (stationReq: any) => {
      const { data } = await apiClient.post('/api/admin/stations', stationReq);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stations'] });
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setShowAddForm(false);
      setName('');
      setAddress('');
    },
  });

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    addStationMutation.mutate({
      name,
      address,
      latitude,
      longitude,
      network,
      state,
      pinCode,
      basePricing,
      operatingHours: '24 Hours',
      contactDetails: '+91 98765 43210',
      status: 'AVAILABLE',
      averageRating: 4.0,
      reviewsCount: 1,
      connectors: [
        {
          connectorType: { id: 1, name: 'CCS2', maxPowerKw: 50.0 },
          status: 'AVAILABLE',
          powerOutputKw: 50.0,
          pricing: basePricing,
        },
      ],
      images: [],
    });
  };

  const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-left pb-10">
      <div className="border-b border-slate-200/50 dark:border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            ChargeWise Control Center
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Platform Administration & Audits Dashboard</p>
        </div>

        {activeTab === 'stations' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Station
          </button>
        )}
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Pending Station Issues</p>
            <p className="font-display font-bold text-base mt-1 text-slate-700 dark:text-slate-200">{pendingReportsCount} tickets</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Registered Drivers</p>
            <p className="font-display font-bold text-base mt-1 text-slate-700 dark:text-slate-200">{users.length} drivers</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Monitored Stations</p>
            <p className="font-display font-bold text-base mt-1 text-slate-700 dark:text-slate-200">{stations.length} locations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reports' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Issue Tickets ({pendingReportsCount})
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'stations' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Stations ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* Add Station Form */}
      {showAddForm && activeTab === 'stations' && (
        <form onSubmit={handleAddStation} className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Add New EV Station</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Station Name" value={name} onChange={e => setName(e.target.value)} required className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={e => setLatitude(parseFloat(e.target.value))} required className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={e => setLongitude(parseFloat(e.target.value))} required className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <select value={network} onChange={e => setNetwork(e.target.value)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none">
              <option value="Tata Power EZ Charge">Tata Power</option>
              <option value="Statiq">Statiq</option>
              <option value="ChargeZone">ChargeZone</option>
              <option value="Jio-bp Pulse">Jio-bp</option>
              <option value="Ather Grid">Ather</option>
            </select>
            <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <input type="text" placeholder="PIN Code" value={pinCode} onChange={e => setPinCode(e.target.value)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
            <input type="number" placeholder="Pricing per kWh (INR)" value={basePricing} onChange={e => setBasePricing(parseFloat(e.target.value))} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs rounded-xl focus:outline-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl">Save Station</button>
        </form>
      )}

      {/* Tab Contents */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading tickets...</div>
            ) : reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No issues reported. System healthy.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {reports.map((report) => (
                  <div key={report.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{report.stationName}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          report.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Issue: {report.issueDescription}</p>
                      <p className="text-[10px] text-slate-450">Reported by: {report.username} &bull; {new Date(report.reportedAt).toLocaleDateString()}</p>
                    </div>

                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => resolveReportMutation.mutate(report.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="space-y-4">
            {stationsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading locations...</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
                {stations.map((st) => (
                  <div key={st.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{st.name}</p>
                      <p className="text-[10px] text-slate-400">{st.address} &bull; ₹{st.basePricing}/kWh</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={st.status}
                        onChange={(e) => changeStatusMutation.mutate({ id: st.id, status: e.target.value })}
                        className="p-1.5 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200/50 dark:border-slate-700 rounded-lg focus:outline-none"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BUSY">BUSY</option>
                        <option value="OFFLINE">OFFLINE</option>
                      </select>

                      <button
                        onClick={() => { if (window.confirm("Confirm delete station?")) deleteStationMutation.mutate(st.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete Station"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {usersLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading user profiles...</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div key={u.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={u.profilePicture} alt="avatar" className="w-8 h-8 rounded-full border border-slate-100" />
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{u.username}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                    </span>
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

export default AdminDashboard;
