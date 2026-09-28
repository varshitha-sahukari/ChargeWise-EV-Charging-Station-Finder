import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterState {
  radius: number;
  connectorType: string;
  fastCharging: string; // 'all' | 'fast' | 'slow'
  status: string; // 'all' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  network: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const networks = [
    'Tata Power EZ Charge',
    'Statiq',
    'ChargeZone',
    'Jio-bp Pulse',
    'Ather Grid',
    'Zeon Charging',
    'Shell Recharge',
  ];

  const connectorTypes = ['CCS2', 'Type 2', 'CHAdeMO', 'AC001', 'DC001'];

  const handleChange = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-lg space-y-4 text-left transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/30 pb-3">
        <h3 className="font-display font-bold text-sm text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          Filter Stations
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-355 flex items-center gap-1 transition-colors cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Radius Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance Radius</label>
          <select
            value={filters.radius}
            onChange={(e) => handleChange('radius', parseInt(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value={9999}>All India</option>
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
          </select>
        </div>

        {/* Connector Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connector Plug</label>
          <select
            value={filters.connectorType}
            onChange={(e) => handleChange('connectorType', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">All Connectors</option>
            {connectorTypes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Speed Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Charging Speed</label>
          <select
            value={filters.fastCharging}
            onChange={(e) => handleChange('fastCharging', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="all">All Speeds</option>
            <option value="fast">Fast Charging (DC &ge; 22kW)</option>
            <option value="slow">Slow Charging (AC &lt; 22kW)</option>
          </select>
        </div>

        {/* Live Availability */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BUSY">BUSY</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>

        {/* Charging Network */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EV Network</label>
          <select
            value={filters.network}
            onChange={(e) => handleChange('network', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">All Networks</option>
            {networks.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
export type { FilterState };
