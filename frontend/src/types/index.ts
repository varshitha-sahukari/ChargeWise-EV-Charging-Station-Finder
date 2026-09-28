export interface UserDto {
  id: number;
  email: string;
  username: string;
  role: string;
  profilePicture: string;
  emailVerified: boolean;
}

export interface AuthRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  username: string;
  role: string;
  userId: number;
}

export interface VehicleDto {
  id?: number;
  brand: string;
  model: string;
  batteryCapacity: number; // kWh
  maxRange: number; // km
  connectorType: string;
  userId?: number;
}

export interface ConnectorTypeDto {
  id: number;
  name: string;
  description: string;
  maxPowerKw: number;
}

export interface StationConnectorDto {
  id: number;
  connectorType: ConnectorTypeDto;
  status: string; // AVAILABLE, BUSY, OFFLINE
  powerOutputKw: number;
  pricing: number;
}

export interface StationImageDto {
  id: number;
  imageUrl: string;
}

export interface StationDto {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  network: string;
  state: string;
  pinCode: string;
  operatingHours: string;
  contactDetails: string;
  basePricing: number;
  status: string; // AVAILABLE, BUSY, OFFLINE
  averageRating: number;
  reviewsCount: number;
  carbonSavedKg: number;
  connectors: StationConnectorDto[];
  images: StationImageDto[];
}

export interface ReviewDto {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  username: string;
  stationId: number;
  stationName?: string;
  createdAt: string;
}

export interface BookingDto {
  id: number;
  userId: number;
  username: string;
  stationId: number;
  stationName: string;
  vehicleId: number;
  vehicleModel: string;
  bookingTime: string;
  startTime: string;
  endTime: string;
  status: string; // PENDING, ACTIVE, COMPLETED, CANCELLED
}

export interface BookingRequest {
  stationId: number;
  vehicleId: number;
  startTime: string;
  endTime: string;
}

export interface ChargingHistoryDto {
  id?: number;
  userId?: number;
  stationId: number;
  stationName?: string;
  vehicleId?: number;
  vehicleModel?: string;
  energyConsumedKwh: number;
  totalCost: number;
  chargingDurationMinutes: number;
  sessionDate?: string;
}

export interface ReportDto {
  id: number;
  userId: number;
  username: string;
  stationId: number;
  stationName: string;
  issueDescription: string;
  status: string; // PENDING, RESOLVED
  reportedAt: string;
}

export interface ReportRequest {
  stationId: number;
  issueDescription: string;
}

export interface RouteRequest {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  vehicleId: number;
  initialSoc: number;
  targetSoc: number;
}

export interface RouteResponse {
  distanceKm: number;
  travelTimeMinutes: number;
  batteryConsumedPercent: number;
  arrivalSoc: number;
  recommendedStops: StationDto[];
  totalChargingCost: number;
  chargingTimeMinutes: number;
  routePoints: [number, number][]; // coordinates [lat, lng]
}

export interface AIRecommendationResponse {
  score: number;
  station: StationDto;
  distanceKm: number;
  predictedPeakHours: number[];
  lessCrowdedAlternative: StationDto | null;
}

export interface AnalyticsDto {
  totalStations: number;
  activeStations: number;
  stateWiseCounts: Record<string, number>;
  topNetworks: Record<string, number>;
  userCount: number;
  activeUsers: number;
  totalEnergyKwh: number;
  totalRevenue: number;
  reportsCount: number;
  sosCount: number;
  averageRating: number;
  fastChargersCount: number;
  slowChargersCount: number;
  chargingTrends: Record<string, number>;
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
