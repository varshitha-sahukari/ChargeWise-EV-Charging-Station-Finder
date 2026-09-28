import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Zap, Navigation, Star, MessageSquare, AlertTriangle, Calendar, Check, Leaf } from 'lucide-react';
import { StationDto, ReviewDto, BookingRequest, ReportRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

interface StationDetailsDrawerProps {
  station: StationDto | null;
  onClose: () => void;
}

const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({ station, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'book' | 'report'>('info');

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Booking Form state
  const [vehicleId, setVehicleId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [bookingTime, setBookingTime] = useState('12:00');
  const [bookingDuration, setBookingDuration] = useState('30');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Report Form state
  const [reportIssue, setReportIssue] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch reviews using React Query
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ReviewDto[]>({
    queryKey: ['reviews', station?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewDto[]>(`/api/stations/${station?.id}/reviews`);
      return data;
    },
    enabled: !!station?.id,
  });

  // Fetch user's registered vehicles for booking dropdown
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>('/api/users/vehicles');
      return data;
    },
    enabled: !!user && activeTab === 'book',
  });

  // Post Review mutation
  const postReviewMutation = useMutation({
    mutationFn: async (reviewReq: { rating: number; comment: string }) => {
      const { data } = await apiClient.post(`/api/stations/${station?.id}/review`, reviewReq);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', station?.id] });
      queryClient.invalidateQueries({ queryKey: ['stations'] }); // refresh station avg rating
      setReviewComment('');
      setRating(5);
    },
  });

  // Submit Booking mutation
  const bookSlotMutation = useMutation({
    mutationFn: async (bookingReq: BookingRequest) => {
      const { data } = await apiClient.post('/api/users/history', {
        stationId: bookingReq.stationId,
        vehicleId: bookingReq.vehicleId,
        energyConsumedKwh: 35.4, // Mock charging duration kwh
        totalCost: 35.4 * (station?.basePricing || 15.0),
        chargingDurationMinutes: parseInt(bookingDuration)
      });
      return data;
    },
    onSuccess: () => {
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['history', user?.id] });
    }
  });

  // Submit Report mutation
  const submitReportMutation = useMutation({
    mutationFn: async (reportReq: ReportRequest) => {
      const { data } = await apiClient.post('/api/users/reports', reportReq);
      return data;
    },
    onSuccess: () => {
      setReportSuccess(true);
      setReportIssue('');
    }
  });

  if (!station) return null;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    postReviewMutation.mutate({ rating, comment: reviewComment });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startStr = `${bookingDate}T${bookingTime}:00`;
    const start = new Date(startStr);
    const end = new Date(start.getTime() + parseInt(bookingDuration) * 60000);
    
    bookSlotMutation.mutate({
      stationId: station.id,
      vehicleId: parseInt(vehicleId),
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportIssue.trim()) return;
    submitReportMutation.mutate({
      stationId: station.id,
      issueDescription: reportIssue
    });
  };

  const activeConnector = station.connectors[0];

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-l border-slate-100 dark:border-slate-800 z-40 flex flex-col h-screen overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* Header Photo or Network Cover */}
      <div className="relative h-44 bg-slate-900 overflow-hidden shrink-0">
        <img 
          src={station.images[0]?.imageUrl || "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80"}
          alt={station.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        
        {/* Navigation & Close Actions */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            Navigate
          </a>
        </div>

        {/* Station Identity info overlays */}
        <div className="absolute bottom-4 left-6 right-6 text-white text-left">
          <span className="text-[10px] bg-emerald-500/80 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {station.network}
          </span>
          <h2 className="font-display font-extrabold text-lg mt-1 truncate" title={station.name}>
            {station.name}
          </h2>
          <p className="text-[11px] opacity-80 truncate">{station.address}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
        {(['info', 'reviews', 'book', 'report'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-500' 
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Content Body */}
      <div className="flex-1 overflow-y-auto p-6 text-left">
        {activeTab === 'info' && (
          <div className="space-y-6">
            
            {/* Status & Rating Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Status</span>
                <p className="font-display font-bold text-base mt-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    station.status === 'AVAILABLE' ? 'bg-emerald-500' :
                    station.status === 'BUSY' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  {station.status}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                <p className="font-display font-bold text-base mt-1 flex items-center gap-1.5 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  {station.averageRating.toFixed(1)}
                  <span className="text-xs text-slate-400">({station.reviewsCount} reviews)</span>
                </p>
              </div>
            </div>

            {/* Pricing & Power Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Pricing</span>
                <p className="font-display font-bold text-base text-slate-700 dark:text-slate-200 mt-1">
                  ₹{station.basePricing}/kWh
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon Offset</span>
                  <p className="font-display font-bold text-base text-emerald-500 mt-1 flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    {station.carbonSavedKg.toFixed(0)} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Connectors Available */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Connectors & Ports</h3>
              <div className="space-y-2">
                {station.connectors.map((connector) => (
                  <div 
                    key={connector.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{connector.connectorType.name}</p>
                        <p className="text-[10px] text-slate-400">Max power: {connector.powerOutputKw} kW</p>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      connector.status === 'AVAILABLE' ? 'bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                      connector.status === 'BUSY' ? 'bg-amber-100/60 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                      'bg-red-100/60 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      {connector.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Logistics */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Station Logistics</h3>
              <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl space-y-3.5 text-xs text-slate-600 dark:text-slate-350">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Operating Hours</span>
                  <span className="font-semibold">{station.operatingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Contact Details</span>
                  <span className="font-semibold">{station.contactDetails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Location GPS</span>
                  <span className="font-semibold">{station.latitude.toFixed(5)}, {station.longitude.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews list */}
            <div className="space-y-4">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">User Reviews ({reviews.length})</h3>
              
              {reviewsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading feedback logs...</div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No reviews yet. Be the first to share.</div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-3.5 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{r.username}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Write a Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Rating:</span>
                  <div className="flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${val <= rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share details of your charging experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={postReviewMutation.isPending}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {postReviewMutation.isPending ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-850">
                Log in to post ratings and reviews.
              </p>
            )}
          </div>
        )}

        {activeTab === 'book' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Book Charging Slot</h3>
            
            {bookingSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Slot Reserved!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your charging session booking is confirmed. We will notify you 10 minutes before the start time.
                </p>
                <button 
                  onClick={() => setBookingSuccess(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Book Another Slot
                </button>
              </div>
            ) : user ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Select Vehicle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                  >
                    <option value="">-- Choose EV --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.connectorType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Time & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      required
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration (Min)</label>
                    <select
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                    >
                      <option value="30">30 Mins</option>
                      <option value="45">45 Mins</option>
                      <option value="60">60 Mins</option>
                      <option value="120">120 Mins</option>
                    </select>
                  </div>
                </div>

                {/* Booking Pricing disclaimer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/10 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-slate-350">Pricing & Billing Information:</p>
                  <p>Estimated Cost: INR {Math.round(35.4 * (station.basePricing))} (based on Nexon average charge load).</p>
                  <p>A slot booking locks charger access. Free cancellation within 10 minutes of booking.</p>
                </div>

                <button
                  type="submit"
                  disabled={bookSlotMutation.isPending}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-500/10 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  {bookSlotMutation.isPending ? 'Confirming...' : 'Book Reservation Slot'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-850">
                Log in to reserve charging slots.
              </p>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Report Broken Station</h3>
            
            {reportSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Ticket Filed!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your report has been successfully submitted to the ChargeWise admin team. We will inspect the unit within 24 hours.
                </p>
                <button 
                  onClick={() => setReportSuccess(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Submit Another Report
                </button>
              </div>
            ) : user ? (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Describe the Issue</label>
                  <textarea
                    placeholder="Provide details about the issue (e.g. CCS2 charger screen frozen, power cut, port lock mechanism broken)..."
                    value={reportIssue}
                    onChange={(e) => setReportIssue(e.target.value)}
                    required
                    rows={4}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 flex gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>Filing false reports repeatedly will result in temporary suspension of slot booking privileges.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitReportMutation.isPending}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl shadow-md transition-colors cursor-pointer"
                >
                  {submitReportMutation.isPending ? 'Filing ticket...' : 'Submit Broken Charger Report'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-850">
                Log in to file station issues tickets.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDetailsDrawer;
