import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Zap, Users, ShieldAlert, CreditCard, Leaf, Battery } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { AnalyticsDto } from '../../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const AnalyticsDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<AnalyticsDto>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get<AnalyticsDto>('/api/analytics');
      return data;
    },
  });

  if (isLoading || !stats) {
    return <div className="py-12 text-center text-xs text-slate-400">Compiling analytics charts...</div>;
  }

  // Parse state counts for Recharts BarChart
  const stateData = Object.entries(stats.stateWiseCounts).map(([name, value]) => ({
    name: name.substring(0, 12),
    Stations: value,
  })).sort((a, b) => b.Stations - a.Stations).slice(0, 8); // top 8 states

  // Parse network counts for Recharts PieChart
  const networkData = Object.entries(stats.topNetworks).map(([name, value]) => ({
    name,
    value,
  }));

  // Parse charging trends for AreaChart
  const trendData = Object.entries(stats.chargingTrends).map(([day, value]) => ({
    name: day,
    Energy: value,
  }));

  // Fast vs Slow data
  const speedData = [
    { name: 'Fast DC (≥22kW)', value: stats.fastChargersCount },
    { name: 'Slow AC (<22kW)', value: stats.slowChargersCount },
  ];

  const cards = [
    { label: 'Total Stations', value: stats.totalStations, sub: `${stats.activeStations} Active Nodes`, icon: Zap, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Registered Drivers', value: stats.userCount, sub: `${stats.activeUsers} Charging Session Logs`, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Total Revenue Generated', value: `₹${stats.totalRevenue.toLocaleString()}`, sub: `₹${(stats.totalRevenue / stats.totalEnergyKwh).toFixed(1)}/kWh average`, icon: CreditCard, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Carbon Emissions Avoided', value: `${(stats.totalEnergyKwh * 0.45).toFixed(0)} kg`, sub: `equivalent to 200+ trees`, icon: Leaf, color: 'text-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40' },
  ];

  return (
    <div className="space-y-6 text-left pb-10">
      <div className="border-b border-slate-200/50 dark:border-slate-800 pb-3">
        <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-100">ChargeWise Analytics Hub</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">National EV charging market metrics & analytics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-md flex items-center gap-4 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{card.label}</p>
              <p className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-150 mt-1">{card.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* State-wise distribution BarChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-md">
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">State-Wise Charging Nodes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="Stations" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Market Share PieChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-md flex flex-col justify-between">
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Network Market Share</h3>
          <div className="h-64 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={networkData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {networkData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-1.5 max-h-56 overflow-y-auto pl-4 text-xs font-medium text-slate-650 dark:text-slate-350">
              {networkData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {entry.name}
                  </span>
                  <span className="font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Charging trends AreaChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-md">
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Daily Load trends (Energy Consumed - kWh)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Energy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fast vs Slow Ratio PieChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-md">
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Charger Output Power Capacity</h3>
          <div className="h-64 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#cbd5e1" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pl-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
              {speedData.map((entry, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: idx === 0 ? '#10b981' : '#cbd5e1' }} />
                    {entry.name}
                  </span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100 ml-4.5">{entry.value} ports ({Math.round(entry.value / (stats.fastChargersCount + stats.slowChargersCount) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
