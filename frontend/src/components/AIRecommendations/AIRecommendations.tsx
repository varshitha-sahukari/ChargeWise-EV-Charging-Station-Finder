import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, MapPin, Zap, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { AIRecommendationResponse } from '../../types';

interface AIRecommendationsProps {
  onInspectStation: (lat: number, lng: number, id: number) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ onInspectStation }) => {
  const [lat, setLat] = useState(12.9716); // default Bengaluru
  const [lng, setLng] = useState(77.5946);
  const [connectorType, setConnectorType] = useState('CCS2');
  const [selectedHub, setSelectedHub] = useState('Bengaluru');

  const hubs: Record<string, [number, number]> = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bengaluru': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Hyderabad': [17.3850, 78.4867],
    'Kolkata': [22.5726, 88.3639],
    'Pune': [18.5204, 73.8567],
    'Jaipur': [26.9124, 75.7873],
  };

  useEffect(() => {
    const coords = hubs[selectedHub];
    if (coords) {
      setLat(coords[0]);
      setLng(coords[1]);
    }
  }, [selectedHub]);

  // Fetch recommendations using React Query
  const { data: recommendations = [], isLoading, refetch } = useQuery<AIRecommendationResponse[]>({
    queryKey: ['ai-recommendations', lat, lng, connectorType],
    queryFn: async () => {
      const { data } = await apiClient.get<AIRecommendationResponse[]>(
        `/api/ai/recommend?latitude=${lat}&longitude=${lng}&connectorType=${connectorType}`
      );
      return data;
    },
  });

  return (
    <div className="space-y-6 text-left pb-10">
      <div className="border-b border-slate-200/50 dark:border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h2 className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 fill-current" />
            AI ChargeWise Recommendations
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Scored using distance, price, ratings, and real-time availability</p>
        </div>
      </div>

      {/* Inputs bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-sm grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Location Hub</label>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500"
          >
            {Object.keys(hubs).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Plug Socket</label>
          <select
            value={connectorType}
            onChange={(e) => setConnectorType(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-emerald-500"
          >
            <option value="CCS2">CCS2 (DC Fast)</option>
            <option value="Type 2">Type 2 (AC Slow)</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="AC001">AC001</option>
            <option value="DC001">DC001</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => refetch()}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Update AI Analysis
          </button>
        </div>
      </div>

      {/* Recommendations Cards List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">AI Engine analyzing charging nodes...</div>
      ) : recommendations.length === 0 ? (
        <div className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          No compatible charging stations found within 25 km of {selectedHub}.
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div 
              key={rec.station.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-3xl shadow-sm grid grid-cols-12 gap-5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-500/20"
            >
              {/* Badge Rank */}
              <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-br-2xl shadow-inner">
                AI RANK #{index + 1}
              </div>

              {/* Station Details */}
              <div className="col-span-8 space-y-4 pt-3 text-left">
                <div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {rec.station.network}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-slate-850 dark:text-slate-100 mt-1.5">{rec.station.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.station.address}</p>
                </div>

                {/* Score parameters */}
                <div className="flex gap-6 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <div>
                    <p>Distance</p>
                    <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">{rec.distanceKm} km</p>
                  </div>
                  <div>
                    <p>Ratings</p>
                    <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">{rec.station.averageRating} ★</p>
                  </div>
                  <div>
                    <p>Pricing</p>
                    <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">₹{rec.station.basePricing}/kWh</p>
                  </div>
                  <div>
                    <p>Socket Speed</p>
                    <p className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                      {rec.station.connectors[0]?.powerOutputKw} kW
                    </p>
                  </div>
                </div>

                {/* Timeline Peak Hours */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Predicted Peak Busy Hours
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const isPeak = rec.predictedPeakHours.includes(hour);
                      return (
                        <div 
                          key={hour}
                          className={`h-4 flex-1 rounded-sm cursor-help relative group ${
                            isPeak 
                              ? 'bg-red-500/80 dark:bg-red-500/60' 
                              : 'bg-emerald-500/20 dark:bg-emerald-500/10'
                          }`}
                          title={`${hour}:00 - ${isPeak ? 'Busy Peak' : 'Not Busy'}`}
                        >
                          {/* tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-950 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                            {hour}:00 - {isPeak ? 'Busy' : 'Free'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>

                {/* Less Crowded Alternative Option */}
                {rec.lessCrowdedAlternative && (
                  <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl flex items-center gap-3 mt-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-650 dark:text-slate-350">Station Busy!</span> Recommended available alternative:{' '}
                      <button 
                        onClick={() => onInspectStation(rec.lessCrowdedAlternative!.latitude, rec.lessCrowdedAlternative!.longitude, rec.lessCrowdedAlternative!.id)}
                        className="font-bold text-amber-500 hover:underline inline-flex items-center gap-0.5"
                      >
                        {rec.lessCrowdedAlternative.name.substring(0, 24)}...
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendation Score Card */}
              <div className="col-span-4 bg-slate-50 dark:bg-slate-850/50 p-5 rounded-2xl flex flex-col items-center justify-center border border-slate-100/50 dark:border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Score</span>
                <p className="font-display font-black text-3xl text-emerald-500 mt-1">{Math.round(rec.score * 100)}</p>
                <p className="text-[10px] text-slate-400 mt-1">out of 100 points</p>
                
                <button
                  onClick={() => onInspectStation(rec.station.latitude, rec.station.longitude, rec.station.id)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors mt-5 cursor-pointer"
                >
                  Locate Node
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
export type { AIRecommendationResponse };
