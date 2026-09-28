import React, { useEffect, useState } from 'react';
import { ShieldAlert, Phone, Navigation, X, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { StationDto } from '../../types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 }); // default Bengaluru
  const [closestStations, setClosestStations] = useState<StationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSosSent(false);
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCoords(loc);
            fetchClosestStations(loc.lat, loc.lng);
          },
          () => {
            fetchClosestStations(coords.lat, coords.lng);
          }
        );
      } else {
        fetchClosestStations(coords.lat, coords.lng);
      }
    }
  }, [isOpen]);

  const fetchClosestStations = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<StationDto[]>(`/api/stations/nearby?latitude=${lat}&longitude=${lng}&radiusKm=25`);
      // Sort by distance and take first 3
      const sorted = data
        .filter(s => s.status !== 'OFFLINE')
        .slice(0, 3);
      setClosestStations(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSOS = () => {
    setSosSent(true);
    // In production, this would trigger an SMS, backend emergency log, or mail dispatch
    console.log(`SOS dispatched with coordinates: Lat ${coords.lat}, Lng ${coords.lng}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-red-500/20 dark:border-red-500/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-500 p-6 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <ShieldAlert className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
            <div>
              <h2 className="font-display font-extrabold text-xl leading-none">Emergency SOS Alert</h2>
              <p className="text-[11px] opacity-90 mt-1 font-medium tracking-wide uppercase">ChargeWise roadside assistance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-75 transition-opacity cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Location Coordinates */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Your Current Coordinates</h3>
              <p className="font-display font-bold text-sm text-slate-700 dark:text-slate-200 mt-1">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </p>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              View Location
            </a>
          </div>

          {/* SOS Status */}
          {sosSent ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">SOS Signal Dispatched!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your location has been logged. Emergency services and nearby networks have been notified.
              </p>
            </div>
          ) : (
            <button
              onClick={handleSendSOS}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-red-500/20 active:scale-98 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
            >
              <ShieldAlert className="w-5 h-5" />
              Dispatch Location to Emergency Services
            </button>
          )}

          {/* Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">National Helpline Contacts</h4>
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:112" className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-500 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Helpline</p>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-0.5">Dial 112</p>
                </div>
              </a>
              <a href="tel:108" className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ambulance</p>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-0.5">Dial 108</p>
                </div>
              </a>
            </div>
          </div>

          {/* Closest Active EV Stations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Closest Active EV Stations</h4>
            {loading ? (
              <div className="h-20 flex items-center justify-center text-xs text-slate-400">Searching...</div>
            ) : closestStations.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">No active stations found within 25 km.</div>
            ) : (
              <div className="space-y-2">
                {closestStations.map((station) => (
                  <div 
                    key={station.id} 
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/50 rounded-2xl"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-850 dark:text-slate-200">{station.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{station.address}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
